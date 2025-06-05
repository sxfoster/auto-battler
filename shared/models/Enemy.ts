import { Card } from './Card';
import { Stats } from './Character';

export interface AIProfile {
  behavior: string; // e.g., 'Aggressive', 'Defensive', 'Random'
  preferredTargets?: string[]; // e.g., ['PlayerCharacter', 'Summon']
}

export interface Enemy {
  id: string;
  archetype: string; // e.g., 'Goblin', 'Dragon', 'Bandit'
  stats: Stats;
  deck: Card[];
  aiProfile: AIProfile;
}
