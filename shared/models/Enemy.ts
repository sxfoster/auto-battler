import { Card } from './Card';
import { Stats } from './Character';

export interface AIProfile {
  behavior: string;
  preferredTargets?: string[];
}

export interface Enemy {
  id: string;
  archetype: string;
  stats: Stats;
  deck: Card[];
  aiProfile: AIProfile;
}
