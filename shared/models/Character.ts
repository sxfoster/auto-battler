import { Card } from './Card';

export interface Stats {
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  speed?: number; // Optional stat
  mana?: number; // Optional stat
  maxMana?: number; // Optional stat
}

export interface SurvivalStats {
  hunger: number;
  maxHunger?: number; // Optional
  thirst: number;
  maxThirst?: number; // Optional
  energy?: number; // Optional
  maxEnergy?: number; // Optional
}

export interface Character {
  id: string;
  name: string;
  class: string; // Consider creating a CharacterClass enum later
  stats: Stats;
  deck: Card[];
  survivalStats: SurvivalStats;
}
