import type { Card } from './Card'

export interface CraftingAttempt {
  /** Cards used in the attempt */
  usedCards: Card[]
  /** Crafted result if successful */
  result: Card | null
  /** Whether the crafting succeeded */
  success: boolean
  /** True if this attempt discovered a new recipe */
  newRecipeDiscovered: boolean
  /** Id of the recipe used if crafting succeeded */
  recipeId: string | null
}
