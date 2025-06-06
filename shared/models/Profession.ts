export type ProfessionName = 'Cooking' | 'Smithing' | 'Alchemy'

import type { Card } from './Card'

export interface Profession {
  /** Profession identifier */
  name: ProfessionName
  /** Current level (1-10) */
  level: number
  /** Accumulated experience points */
  experience: number
  /** Recipe ids the player has discovered */
  unlockedRecipes: string[]
  /** Special cards awarded for this profession */
  professionOnlyCards: Card[]
}
