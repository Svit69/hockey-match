import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Player, SearchResult, MatchType } from '../types/players';

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
  transform-style: preserve-3d;
  perspective: 1000px;
`;

const SearchWrapper = styled.div<{ isFocused: boolean }>`
  position: relative;
  width: 100%;
  background: url('/placeholder.svg') no-repeat;
  background-size: cover;
  margin-left: 16px;
  cursor: text;
  transform-style: preserve-3d;
  transition: transform 0.1s ease-out;
  transform: ${props => props.isFocused ? 'scale(1.05)' : 'scale(1)'};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 12px 12px 48px;
  background: transparent;
  border: none;
  color: #1a1a1a;
  font-size: 16px;
  caret-color: #1a1a1a;

  &::placeholder {
    color: #8F8F8F;
  }

  &:focus {
    outline: none;
  }
`;

const SearchIcon = styled.img`
  position: absolute;
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  pointer-events: none;
  z-index: 1;
`;

const ResultsList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  background: #2a2a2a;
  border-radius: 4px;
  margin-top: 4px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
`;

const ResultItem = styled.li`
  padding: 12px;
  cursor: pointer;
  border-bottom: 1px solid #3a3a3a;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #3a3a3a;
  }
`;

const PlayerName = styled.div`
  font-weight: bold;
`;

interface PlayerSearchProps {
  onSelect: (result: SearchResult) => void;
}

// Карта замен букв для более лояльного поиска
const letterEquivalents: { [key: string]: string[] } = {
  'е': ['ё', 'э'],
  'ё': ['е', 'э'],
  'э': ['е', 'ё'],
  'и': ['й', 'ы'],
  'й': ['и'],
  'ы': ['и'],
  'а': ['я'],
  'я': ['а'],
  'у': ['ю'],
  'ю': ['у']
};

// Функция для создания всех возможных вариантов написания
const generateVariants = (text: string): string[] => {
  const variants = new Set([text]);
  
  // Проходим по каждой букве в тексте
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const equivalents = letterEquivalents[char];
    
    if (equivalents) {
      // Для каждого эквивалента создаем новый вариант
      const currentVariants = Array.from(variants);
      currentVariants.forEach(variant => {
        equivalents.forEach(equivalent => {
          variants.add(
            variant.slice(0, i) + equivalent + variant.slice(i + 1)
          );
        });
      });
    }
  }
  
  return Array.from(variants);
};

// Функция для нормализации текста
const normalizeText = (text: string): string => {
  const normalized = text
    .toLowerCase()
    // Базовая нормализация
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // Удаляем диакритические знаки
    // Стандартизация имен
    .replace(/^([а-яё])/i, letter => letter.toUpperCase()) // Первая буква заглавная
    .replace(/[^a-zа-яё0-9\s-]/g, '') // Оставляем только буквы, цифры, пробелы и дефис
    .replace(/\s+/g, ' ') // Убираем множественные пробелы
    .trim();

  return normalized;
};

// Функция для проверки инициалов
const matchesWithInitials = (fullName: string, searchTerm: string): boolean => {
  const parts = fullName.split(' ');
  if (parts.length < 2) return false;

  // Получаем инициалы
  const initials = parts.map(part => part[0]).join('');
  const searchInitials = searchTerm.replace(/\s+/g, '');

  return initials.toLowerCase().includes(searchInitials.toLowerCase());
};

// Функция для вычисления расстояния Левенштейна (для нечеткого поиска)
const levenshteinDistance = (a: string, b: string): number => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = Array(b.length + 1).fill(null).map(() => 
    Array(a.length + 1).fill(null)
  );

  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // удаление
        matrix[j - 1][i] + 1, // вставка
        matrix[j - 1][i - 1] + substitutionCost // замена
      );
    }
  }

  return matrix[b.length][a.length];
};

// Функция для определения схожести строк (в процентах)
const calculateSimilarity = (a: string, b: string): number => {
  const distance = levenshteinDistance(a, b);
  const maxLength = Math.max(a.length, b.length);
  return (1 - distance / maxLength) * 100;
};

export const PlayerSearch: React.FC<PlayerSearchProps> = ({ onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const searchPlayers = async () => {
      if (searchTerm.length < 2) {
        setResults([]);
        return;
      }

      try {
        const response = await fetch('/players.csv');
        const text = await response.text();
        const players = parseCSV(text);
        
        const normalizedSearchTerm = normalizeText(searchTerm);
        const searchVariants = generateVariants(normalizedSearchTerm);
        
        const filtered = players
          .map(player => {
            const normalizedName = normalizeText(player.name);
            const nameVariants = generateVariants(normalizedName);
            
            // Проверяем различные варианты соответствия
            const exactMatch = nameVariants.some(variant =>
              searchVariants.some(searchVariant => variant.includes(searchVariant))
            );
            
            const initialsMatch = matchesWithInitials(normalizedName, normalizedSearchTerm);
            
            // Вычисляем наилучшее соответствие среди всех вариантов
            let bestSimilarity = 0;
            nameVariants.forEach(nameVariant => {
              searchVariants.forEach(searchVariant => {
                const similarity = calculateSimilarity(nameVariant, searchVariant);
                bestSimilarity = Math.max(bestSimilarity, similarity);
              });
            });

            return {
              player,
              similarity: exactMatch ? 100 : initialsMatch ? 90 : bestSimilarity,
              matchType: (exactMatch ? 'exact' : initialsMatch ? 'initials' : 'fuzzy') as MatchType
            };
          })
          .filter(result => {
            // Показываем результаты с высокой схожестью или совпадением по инициалам
            return result.similarity >= 60;
          })
          .sort((a, b) => {
            // Сортируем сначала по типу совпадения, затем по схожести
            if (a.matchType !== b.matchType) {
              const typeOrder: Record<MatchType, number> = {
                exact: 0,
                initials: 1,
                fuzzy: 2
              };
              return typeOrder[a.matchType] - typeOrder[b.matchType];
            }
            return b.similarity - a.similarity;
          })
          .slice(0, 10);

        setResults(filtered);
      } catch (error) {
        console.error('Error searching players:', error);
        setResults([]);
      }
    };

    const timeoutId = setTimeout(searchPlayers, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSelect = (result: SearchResult) => {
    onSelect(result);
    setSearchTerm('');
    setResults([]);
    setIsFocused(false);
  };

  return (
    <SearchContainer>
      <SearchWrapper isFocused={isFocused}>
        <SearchIcon src="/search.svg" alt="Search" />
        <SearchInput
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => !searchTerm && setIsFocused(false)}
          placeholder="Поиск"
        />
      </SearchWrapper>
      {results.length > 0 && (
        <ResultsList>
          {results.map((result, index) => (
            <ResultItem key={index} onClick={() => handleSelect(result)}>
              <PlayerName>{result.player.name}</PlayerName>
            </ResultItem>
          ))}
        </ResultsList>
      )}
    </SearchContainer>
  );
};

// Вспомогательная функция для парсинга CSV
function parseCSV(csv: string): Player[] {
  const lines = csv.split(/\r?\n/).filter(line => line.trim() !== '');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return {
      name: values[headers.indexOf('name')].trim(),
      teams: values[headers.indexOf('teams')].split(';').map(team => team.trim()),
    };
  });
} 