import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Player, SearchResult } from '../types/players';

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

// Функция для нормализации текста
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    // Замена ё на е
    .replace(/ё/g, 'е')
    // Удаление всех диакритических знаков
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    // Удаление специальных символов
    .replace(/[^a-zа-я0-9\s]/g, '')
    // Удаление множественных пробелов
    .replace(/\s+/g, ' ')
    .trim();
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
        
        const filtered = players
          .map(player => {
            const normalizedName = normalizeText(player.name);
            const similarity = calculateSimilarity(normalizedName, normalizedSearchTerm);
            
            return {
              player,
              similarity,
              matchType: 'name' as const
            };
          })
          .filter(result => {
            // Показываем результаты с схожестью более 60%
            // или если нормализованное имя содержит поисковый запрос
            const normalizedName = normalizeText(result.player.name);
            return result.similarity >= 60 || 
                   normalizedName.includes(normalizedSearchTerm);
          })
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, 10); // Ограничиваем количество результатов

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