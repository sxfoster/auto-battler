import { test } from 'node:test'
import assert from 'assert'
import { craftWithInventory } from './crafting.js'
import { sampleCards } from '../models/cards.js'
import { sampleRecipes } from '../models/recipes.js'

const herb = { ...sampleCards.find(c => c.id === 'herb') }
const bread = { ...sampleCards.find(c => c.id === 'bread') }

const profession = { name: 'Cooking', level: 1, experience: 0, unlockedRecipes: [], professionOnlyCards: [] }
const player = { id: 'p1', name: 'Hero', professions: { Cooking: profession }, discoveredRecipes: [], currencies: {} }

const inventory = { items: [herb, bread] }

test('craftWithInventory crafts item and updates progression', () => {
  const attempt = craftWithInventory(player, profession, [herb, bread], sampleRecipes, inventory)
  assert.ok(attempt.success)
  assert.strictEqual(attempt.recipeId, 'cooked_meat')
  assert.strictEqual(inventory.items.length, 1)
  assert.strictEqual(inventory.items[0].name, 'Cooked Meat')
  assert.ok(player.discoveredRecipes.includes('cooked_meat'))
  assert.ok(profession.unlockedRecipes.includes('cooked_meat'))
  assert.strictEqual(profession.experience, 10)
})

import { attemptCraft } from './crafting.js'

const dummyCards = {
  herb: { id: 'herb', name: 'Herb' },
  bread: { id: 'bread', name: 'Bread' },
  iron_sword: { id: 'iron_sword', name: 'Iron Sword' },
}

test('attemptCraft deducts currency on success', () => {
  const prof = { name: 'Cooking', level: 1, experience: 0, unlockedRecipes: [] }
  const player = {
    id: 'p1',
    name: 'Test',
    professions: { Cooking: prof },
    discoveredRecipes: [],
    currencies: { Gold: 10, GuildCredit: 0 },
  }
  const used = [dummyCards.herb, dummyCards.bread]
  const result = attemptCraft(prof, used, sampleRecipes, player)
  assert.strictEqual(result.success, true)
  assert.strictEqual(player.currencies.Gold, 5)
})

test('attemptCraft fails without funds', () => {
  const prof = { name: 'Smithing', level: 2, experience: 0, unlockedRecipes: [] }
  const player = {
    id: 'p2',
    name: 'NoMoney',
    professions: { Smithing: prof },
    discoveredRecipes: [],
    currencies: { Gold: 0, GuildCredit: 0 },
  }
  const used = [dummyCards.iron_sword, dummyCards.herb]
  const result = attemptCraft(prof, used, sampleRecipes, player)
  assert.strictEqual(result.success, false)
})
