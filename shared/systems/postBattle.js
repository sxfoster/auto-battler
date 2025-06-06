import { enemies } from '../models/enemies.js'

/**
 * Apply survival penalties to each character after a battle
 * @param {import('../models').Character[]} party
 */
export function applySurvivalPenalties(party) {
  party.forEach((c) => {
    if (!c.survival) c.survival = { hunger: 0, thirst: 0, fatigue: 0 }
    c.survival.fatigue += 1
    c.survival.hunger += 1
    c.survival.thirst += 1
  })
}

/**
 * Generate loot based on the encounter
 * @param {import('../models').Encounter} encounter
 * @returns {import('../models').LootItem[]}
 */
export function generateLoot(encounter) {
  const loot = []
  const baseRarity = ['Common', 'Uncommon', 'Rare']
  const types = ['Ability', 'Equipment', 'Ingredient', 'FoodDrink', 'Elixir', 'Utility']
  const count = Math.max(1, Math.floor(encounter.difficulty))
  for (let i = 0; i < count; i++) {
    loot.push({
      id: `${encounter.biome}-${Date.now()}-${i}`,
      type: types[Math.floor(Math.random() * types.length)],
      rarity: baseRarity[Math.min(baseRarity.length - 1, Math.floor(Math.random() * encounter.difficulty))],
      effects: [],
    })
  }
  return loot
}

/**
 * Generate currency rewards for an encounter
 * @param {import('../models').Encounter} encounter
 * @returns {{Gold:number, GuildCredit:number}}
 */
export function generateCurrencyReward(encounter) {
  const gold = Math.floor(encounter.difficulty * 5)
  const guildCredit = Math.random() < 0.1 * encounter.difficulty ? 1 : 0
  return { Gold: gold, GuildCredit: guildCredit }
}

/**
 * Apply currency rewards to a player
 * @param {import('../models').Player} player
 * @param {{Gold:number, GuildCredit:number}} reward
 */
export function awardCurrency(player, reward) {
  if (reward.Gold)
    player.currencies.Gold = (player.currencies.Gold || 0) + reward.Gold
  if (reward.GuildCredit)
    player.currencies.GuildCredit =
      (player.currencies.GuildCredit || 0) + reward.GuildCredit
}

/**
 * Add loot items to the inventory
 * @param {import('../models').LootItem[]} loot
 * @param {import('../models').Inventory} inventory
 */
export function distributeLoot(loot, inventory) {
  inventory.items.push(...loot)
}

/**
 * Use a consumable item on a character
 * @param {import('../models').LootItem} item
 * @param {import('../models').Character} character
 */
export function useConsumable(item, character) {
  if (!item.effects) return
  item.effects.forEach((e) => {
    if (e.type === 'RestoreFatigue') {
      character.survival.fatigue = Math.max(0, character.survival.fatigue - e.value)
    }
    if (e.type === 'RestoreHunger') {
      character.survival.hunger = Math.max(0, character.survival.hunger - e.value)
    }
    if (e.type === 'RestoreThirst') {
      character.survival.thirst = Math.max(0, character.survival.thirst - e.value)
    }
  })
}

/**
 * Rest the party, reducing fatigue
 * @param {import('../models').Character[]} party
 * @param {number} duration
 */
export function rest(party, duration) {
  party.forEach((c) => {
    c.survival.fatigue = Math.max(0, c.survival.fatigue - duration)
  })
}
