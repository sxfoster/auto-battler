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
