import { test } from 'node:test'
import assert from 'assert'
import { attemptCraft } from './crafting.js'
import { sampleRecipes } from '../models/recipes.js'

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

