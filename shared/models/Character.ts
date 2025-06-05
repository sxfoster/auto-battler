import { Card } from './Card';

export interface Stats {
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  speed?: number;
  mana?: number;
  maxMana?: number;
}

export interface SurvivalStats {
  hunger: number;
  maxHunger?: number;
  thirst: number;
  maxThirst?: number;
  energy?: number;
  maxEnergy?: number;
}

export interface Character {
  id: string;
  name: string;
  class: string;
  stats: Stats;
  deck: Card[];
  survivalStats: SurvivalStats;
}
