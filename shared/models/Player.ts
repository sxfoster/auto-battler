import type { Profession } from './Profession'

export interface Player {
  /** Unique id */
  id: string
  /** Display name */
  name: string
  /** Professions the player has */
  professions: Record<string, Profession>
  /** Discovered recipe ids */
  discoveredRecipes: string[]
}
