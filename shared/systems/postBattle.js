import { enemies } from '../models/enemies.js'

/**
 * Applies survival penalties (fatigue, hunger, thirst) to each character in the party after a battle.
 * Each penalty is incremented by 1. If a character does not have a survival object, it's initialized.
 *
 * @param {import('../models').Character[]} party - An array of character objects. Each character object is mutated.
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
 * Generates loot items based on the details of an encounter, such as biome and difficulty.
 * The number of loot items is determined by the encounter's difficulty.
 * The type and rarity of loot are randomized.
 *
 * @param {import('../models').Encounter} encounter - The encounter object, containing biome and difficulty information.
 * @returns {import('../models').LootItem[]} An array of generated loot items.
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
 * Adds an array of loot items to a given inventory.
 *
 * @param {import('../models').LootItem[]} loot - An array of loot items to add.
 * @param {import('../models').Inventory} inventory - The inventory object to add items to. This object is mutated.
 */
export function distributeLoot(loot, inventory) {
  inventory.items.push(...loot)
}

/**
 * Applies the effects of a consumable item to a character's survival stats.
 * Supported effects include restoring fatigue, hunger, and thirst.
 *
 * @param {import('../models').LootItem} item - The consumable item to use. Must have an `effects` array.
 * @param {import('../models').Character} character - The character to apply the effects to. This character's `survival` object is mutated.
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
 * Allows the party to rest, reducing fatigue for each character by a specified duration.
 * Fatigue cannot go below 0.
 *
 * @param {import('../models').Character[]} party - An array of character objects. Each character's `survival.fatigue` is mutated.
 * @param {number} duration - The amount of fatigue to restore.
 */
export function rest(party, duration) {
  party.forEach((c) => {
    c.survival.fatigue = Math.max(0, c.survival.fatigue - duration)
  })
}
