import type { Character } from '../models/Character'
import type { LootItem } from '../models/LootItem'
import type { Inventory } from '../models/Inventory'
import type { Encounter } from '../models/Encounter'

export function applySurvivalPenalties(party: Character[]): void
export function generateLoot(encounter: Encounter): LootItem[]
export function distributeLoot(loot: LootItem[], inventory: Inventory): void
export function useConsumable(item: LootItem, character: Character): void
export function rest(party: Character[], duration: number): void
export function handleAdvance(state: import('../models').GameState): void
export function handleRetreat(state: import('../models').GameState): void
export function presentDecisionPoint(): void
export function attemptCraft(
  profession: import('../models').Profession,
  usedCards: import('../models').Card[],
  recipes: import('../models').Recipe[],
): import('../models').CraftingAttempt
export function getAvailableRecipes(
  profession: import('../models').Profession,
  recipes: import('../models').Recipe[],
): import('../models').Recipe[]
export function levelUpProfession(profession: import('../models').Profession, exp: number): void
export function registerRecipeDiscovery(
  player: import('../models').Player,
  recipe: import('../models').Recipe,
): void
