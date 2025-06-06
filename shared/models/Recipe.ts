import type { Card } from './Card'
import type { ProfessionName } from './Profession'

export interface Recipe {
  /** Unique recipe id */
  id: string
  /** Card ids or ingredient ids required */
  ingredients: string[]
  /** Resulting crafted card */
  result: Card
  /** Profession that can craft this recipe */
  profession: ProfessionName
  /** Minimum profession level required */
  levelRequirement: number
}
