export interface Player {
  name: string;
  teams: string[];
  // Добавьте другие поля, которые есть в вашем CSV файле
}

export interface SearchResult {
  player: Player;
  matchType: 'name' | 'team';
} 