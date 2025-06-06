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
