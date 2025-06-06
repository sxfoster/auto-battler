import { test } from 'node:test'
import assert from 'assert'
import { sellItem, getAvailableListings, updatePlayerBalance } from './market.js'

// simple market listing test

test('sellItem adds listing in correct market', () => {
  // reset player's balances & listings - can't easily because not exported, but we can rely on zero state since tests run fresh
  const item = { id: '1', name: 'Sword', category: 'Weapon', price: 10, currencyType: 'Gold', rarity: 'Common' }
  const listing = sellItem('player1', item, 'Town', 10, 'Gold')
  const townListings = getAvailableListings('Town')
  assert.deepStrictEqual(townListings[0], listing)
})
