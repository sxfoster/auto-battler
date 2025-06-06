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
export function craftWithInventory(
  player: import('../models').Player,
  profession: import('../models').Profession,
  usedCards: import('../models').Card[],
  recipes: import('../models').Recipe[],
  inventory: import('../models').Inventory,
): import('../models').CraftingAttempt
export function updatePlayerBalance(
  playerId: string,
  currency: import('../models').CurrencyType,
  amount: number,
): void
export function getAvailableListings(
  marketType: import('../models').MarketType,
  filters?: Record<string, any>,
): import('../models').MarketListing[]
export function buyItem(
  playerId: string,
  marketType: import('../models').MarketType,
  itemId: string,
): boolean
export function sellItem(
  playerId: string,
  item: import('../models').MarketItem,
  marketType: import('../models').MarketType,
  price: number,
  currency: import('../models').CurrencyType,
): import('../models').MarketListing
export function placeBid(
  playerId: string,
  itemId: string,
  amount: number,
): boolean
export function restockMarketplace(
  marketType: import('../models').MarketType,
  newItems?: import('../models').MarketItem[],
): void
export function listGuildItem(
  playerId: string,
  item: import('../models').MarketItem,
  price: number,
): import('../models').MarketListing
export function canUseCard(
  character: import('../models').Character,
  card: import('../models').Card,
): boolean
export function applyRolePenalty(
  card: import('../models').Card,
  character: import('../models').Character,
): import('../models').Effect
export function applyClassSynergy(
  card: import('../models').Card,
  character: import('../models').Character,
): import('../models').Effect | null
export function getSynergyBonuses(
  card: import('../models').Card,
  character: import('../models').Character,
): import('../models').Effect[]
export function applyBiomeBonuses(
  biome: import('../models').Biome,
  enemies: import('../models').Enemy[],
): void
export function resetBiomeBonuses(enemies: import('../models').Enemy[]): void
export function getCurrentBiome(
  state: import('../models').GameState,
): import('../models').Biome
export function spawnEnemiesForFloor(
  floor: import('../models').Encounter,
): import('../models').Enemy[]
export function trackEnemyActions(
  enemy: import('../models').Enemy,
  card: import('../models').Card,
  turn: number,
  group?: { lastUsedCards?: { card: import('../models').Card; turn: number }[] },
): void
export function findComboStarter(cards: import('../models').Card[], comboTag: string): import('../models').Card | null
export function findComboFinisher(cards: import('../models').Card[], comboTag: string): import('../models').Card | null
export function shouldExecuteCombo(
  enemy: import('../models').Enemy,
  context: { currentTurn: number; group?: { lastUsedCards?: { card: import('../models').Card; turn: number }[] } },
): boolean
export function chooseEnemyAction(
  enemy: import('../models').Enemy,
  context: { currentTurn: number; group?: { lastUsedCards?: { card: import('../models').Card; turn: number }[] } },
): import('../models').Card
