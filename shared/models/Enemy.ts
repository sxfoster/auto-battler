import type { Card } from './Card'
import type { Stats } from './Character'

export interface AIProfile {
  /** Short descriptor of behavior (e.g. "aggressive", "defensive") */
  behavior: string
  /** Value from 0-1 representing how likely the enemy is to attack */
  aggressiveness: number
  /** Whether the AI attempts to chain combo cards */
  enableComboAwareness?: boolean
  /** Turns within which a starter and finisher can connect */
  comboWindowTurns?: number
  /** If true, prefers to play finishers when possible */
  prefersFinisherChains?: boolean
  /** Preferred combo tags when multiple options exist */
  preferredComboTags?: string[]
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
  /** Memory of recently used cards for combo logic */
  lastUsedCards?: { card: Card; turn: number }[]
}
