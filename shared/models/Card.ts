export interface Effect {
  attribute: string; // e.g., 'health', 'damage', 'mana'
  value: number | string; // Can be a numerical change or a status effect name
  target?: string; // e.g., 'self', 'targetEnemy', 'allEnemies'. Optional.
}

export interface Card {
  id: string;
  name: string;
  type: string; // e.g., 'Attack', 'Defense', 'Utility'.
  cost: number;
  effects: Effect[];
  description: string;
}
