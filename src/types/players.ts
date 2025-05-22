export interface Player {
  name: string;
  teams: string[];
  // Добавьте другие поля, которые есть в вашем CSV файле
}

export type MatchType = 'exact' | 'initials' | 'fuzzy';

export interface SearchResult {
  player: Player;
  similarity: number;
  matchType: MatchType;
} 