import type { Card } from './Card'

export interface Stats {
  /** Health points */
  hp: number
  /** Energy or mana available each turn */
  energy: number
  /** Optional attack attribute */
  attack?: number
  /** Optional defense attribute */
  defense?: number
  /** Optional speed attribute */
  speed?: number
}

export interface SurvivalStats {
  /** Hunger level */
  hunger: number
  /** Thirst level */
  thirst: number
  /** Fatigue or tiredness */
  fatigue: number
}

export interface Character {
  /** Unique character id */
  id: string
  /** Character name */
  name: string
  /** Character class or role */
  class: string
  /** Path or URL to the character's portrait image */
  portrait: string // Added
  /** A brief description of the character */
  description: string // Added
  /** Primary combat stats */
  stats: Stats
  /** Deck of cards assigned to this character */
  deck: Card[]
  /** Survival stats tracked outside combat */
  survival: SurvivalStats
}
