import type { Card } from './Card'
import type { Stats } from './Character'

export interface AIProfile {
  /** Short descriptor of behavior (e.g. "aggressive", "defensive") */
  behavior: string
  /** Value from 0-1 representing how likely the enemy is to attack */
  aggressiveness: number
}

export interface Enemy {
  /** Unique enemy id */
  id: string
  /** The archetype or species of the enemy */
  archetype: string
  /** Combat stats */
  stats: Stats
  /** Cards used by this enemy */
  deck: Card[]
  /** AI behavior profile */
  aiProfile: AIProfile
}
