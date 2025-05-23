export interface Player {
  name: string;
  teams: string[];
  played_in_nhl: boolean;
  gagarin_cup: boolean;
  // Добавьте другие поля, которые есть в вашем CSV файле
}

export type MatchType = 'exact' | 'initials' | 'fuzzy';

export interface SearchResult {
  player: Player;
  similarity: number;
  matchType: MatchType;
}

export interface TaskVariant {
  type: 'club' | 'nhl' | 'gagarin';
  logoFile?: string;
  name: string;
}

export interface Task {
  firstClub: string;
  secondVariant: TaskVariant;
} 