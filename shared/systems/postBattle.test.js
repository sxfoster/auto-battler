import { test } from 'node:test'
import assert from 'assert'
import { awardCurrency, generateCurrencyReward } from './postBattle.js'

test('awardCurrency increases player balances', () => {
  const player = { currencies: { Gold: 0, GuildCredit: 0 } }
  awardCurrency(player, { Gold: 5, GuildCredit: 1 })
  assert.strictEqual(player.currencies.Gold, 5)
  assert.strictEqual(player.currencies.GuildCredit, 1)
})

test('generateCurrencyReward returns numbers', () => {
  const reward = generateCurrencyReward({ difficulty: 2 })
  assert.ok(reward.Gold >= 0)
})

test('generateCurrencyReward caps guild credit chance at 100%', () => {
  const origRand = Math.random
  Math.random = () => 0
  const reward = generateCurrencyReward({ difficulty: 20 })
  Math.random = origRand
  assert.strictEqual(reward.GuildCredit, 1)
})

