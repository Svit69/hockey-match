import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Player, SearchResult, MatchType } from '../types/players';

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
  transform-style: preserve-3d;
  perspective: 1000px;

  @media (max-width: 768px) {
    max-width: 100%;
    padding: 0;
    margin: 0 auto;
  }
`;

const SearchWrapper = styled.div<{ isFocused: boolean }>`
  position: relative;
  width: 100%;
  background: #2a2a2a;
  border-radius: 4px;
  margin-left: 16px;
  cursor: text;
  transform-style: preserve-3d;
  transition: transform 0.1s ease-out;
  transform: ${props => props.isFocused ? 'scale(1.05)' : 'scale(1)'};
  z-index: 1002;

  @media (max-width: 768px) {
    margin-left: 0;
    transform: none;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 12px 12px 48px;
  background: transparent;
  border: none;
  color: white;
  font-size: 16px;
  caret-color: white;
  -webkit-appearance: none;
  border-radius: 0;
  box-sizing: border-box;
  position: relative;
  z-index: 1002;

  &::placeholder {
    color: #8F8F8F;
  }

  &:focus {
    outline: none;
  }

  @media (max-width: 768px) {
    font-size: 16px;
    padding: 16px 16px 16px 48px;
    width: 100%;
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

  @media (max-width: 768px) {
    left: 8px;
  }
`;

const ResultsList = styled.ul<{ isVisible: boolean }>`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  background: #2a2a2a;
  border-radius: 4px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1001;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    position: absolute;
    top: calc(100% + 4px);
    max-height: 60vh;
    border-radius: 4px;
    margin: 0 16px;
  }

  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const ResultItem = styled.li`
  padding: 12px;
  cursor: pointer;
  border-bottom: 1px solid #3a3a3a;
  position: relative;
  z-index: 1002;
  -webkit-tap-highlight-color: rgba(0,0,0,0);
  touch-action: manipulation;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #3a3a3a;
  }

  @media (max-width: 768px) {
    padding: 16px;
    
    &:active {
      background: #3a3a3a;
    }
  }
`;

const PlayerName = styled.div`
  font-weight: bold;

  @media (max-width: 768px) {
    font-size: 16px;
    line-height: 1.4;
  }
`;

interface PlayerSearchProps {
  onSelect: (result: SearchResult) => void;
}

// Карта замен букв для более лояльного поиска (уменьшенная версия)
const letterEquivalents: { [key: string]: string[] } = {
  'е': ['ё'],  // Оставляем только самые важные замены
  'ё': ['е'],
  'й': ['и'],
  'и': ['й']
};

// Оптимизированная функция для создания вариантов
const generateVariants = (text: string): string[] => {
  const variants = new Set([text]);
  
  // Создаем только один уровень замен
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const equivalents = letterEquivalents[char];
    
    if (equivalents) {
      equivalents.forEach(equivalent => {
        variants.add(
          text.slice(0, i) + equivalent + text.slice(i + 1)
        );
      });
    }
  }
  
  return Array.from(variants);
};

// Оптимизированная функция для нормализации текста
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/ё/g, 'е') // Сразу заменяем ё на е
    .replace(/\s+/g, ' ') // Убираем множественные пробелы
    .trim();
};

// Упрощенная функция для проверки инициалов
const matchesWithInitials = (fullName: string, searchTerm: string): boolean => {
  if (searchTerm.length < 2) return false;
  
  const parts = fullName.split(' ');
  if (parts.length < 2) return false;

  const initials = parts.map(part => part[0]).join('').toLowerCase();
  const searchInitials = searchTerm.replace(/\s+/g, '').toLowerCase();

  return initials.startsWith(searchInitials);
};

// Упрощенная функция для определения схожести строк
const calculateSimilarity = (a: string, b: string): number => {
  if (a.includes(b)) return 100;
  if (b.includes(a)) return 90;
  
  // Проверяем начало слова
  if (a.startsWith(b)) return 85;
  
  // Простая проверка на количество совпадающих символов
  let matches = 0;
  const minLength = Math.min(a.length, b.length);
  
  for (let i = 0; i < minLength; i++) {
    if (a[i] === b[i]) matches++;
  }
  
  return (matches / Math.max(a.length, b.length)) * 100;
};

export const PlayerSearch: React.FC<PlayerSearchProps> = ({ onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setResults([]);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
            
            // Проверяем точное совпадение
            const exactMatch = searchVariants.some(variant => 
              normalizedName.includes(variant)
            );
            
            // Проверяем инициалы только если нет точного совпадения
            const initialsMatch = !exactMatch && 
              matchesWithInitials(normalizedName, normalizedSearchTerm);
            
            // Вычисляем схожесть только если нет других совпадений
            const similarity = !exactMatch && !initialsMatch ? 
              calculateSimilarity(normalizedName, normalizedSearchTerm) : 0;

            return {
              player,
              similarity: exactMatch ? 100 : initialsMatch ? 90 : similarity,
              matchType: (exactMatch ? 'exact' : initialsMatch ? 'initials' : 'fuzzy') as MatchType
            };
          })
          .filter(result => result.similarity >= 70) // Повышаем порог схожести
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, 7); // Уменьшаем количество результатов

        setResults(filtered);
      } catch (error) {
        console.error('Error searching players:', error);
        setResults([]);
      }
    };

    const timeoutId = setTimeout(searchPlayers, 200);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSelect = (result: SearchResult) => {
    onSelect(result);
    setSearchTerm('');
    setResults([]);
    setIsFocused(false);
  };

  return (
    <SearchContainer ref={searchContainerRef}>
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
        <ResultsList isVisible={true}>
          {results.map((result, index) => (
            <ResultItem 
              key={index} 
              onClick={() => handleSelect(result)}
              onTouchEnd={() => handleSelect(result)}
            >
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
      played_in_nhl: values[headers.indexOf('played_in_nhl')].toLowerCase() === 'true',
      gagarin_cup: values[headers.indexOf('gagarin_cup')].toLowerCase() === 'true'
    };
  });
} 