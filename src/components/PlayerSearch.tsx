import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Player, SearchResult } from '../types/players';

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
`;

const SearchWrapper = styled.div`
  position: relative;
  width: 100%;
  background: url('/placeholder.svg') no-repeat;
  background-size: cover;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 12px 12px 40px;
  background: transparent;
  border: none;
  color: white;
  font-size: 16px;

  &::placeholder {
    color: #8F8F8F;
  }

  &:focus {
    outline: none;
  }
`;

const SearchIcon = styled.img`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  pointer-events: none;
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

export const PlayerSearch: React.FC<PlayerSearchProps> = ({ onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    const searchPlayers = async () => {
      if (searchTerm.length < 2) {
        setResults([]);
        return;
      }

      try {
        // Здесь будет логика загрузки и фильтрации данных из CSV
        // Пока используем заглушку
        const response = await fetch('/players.csv');
        const text = await response.text();
        const players = parseCSV(text);
        
        const filtered = players.filter(player => 
          player.name.toLowerCase().includes(searchTerm.toLowerCase())
        ).map(player => ({
          player,
          matchType: 'name' as const
        }));

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
  };

  return (
    <SearchContainer>
      <SearchWrapper>
        <SearchIcon src="/search.svg" alt="Search" />
        <SearchInput
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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