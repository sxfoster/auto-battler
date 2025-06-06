import { test } from 'node:test'
import assert from 'assert'
import { canUseAbility, applyCooldown, tickCooldowns } from './abilities.js'

const char = { id: 'c1', name: 'Hero', stats: { hp: 10, energy: 3 }, deck: [], survival: { hunger:0, thirst:0, fatigue:0 } }
const card = { id: 'strike', name: 'Strike', category: 'Ability', rarity: 'Common', energyCost:1, cooldown:2, effect:{ type:'damage', magnitude: 3 }, roleTag:'DPS' }

 test('canUseAbility false when on cooldown', () => {
   applyCooldown(char, card)
   assert.strictEqual(canUseAbility(char, card), false)
 })

 test('tickCooldowns reduces cooldown', () => {
   applyCooldown(char, card)
   tickCooldowns(char)
   assert.strictEqual(char.cooldowns[card.id], 1)
 })

 test('cooldown reaches zero', () => {
   applyCooldown(char, card)
   tickCooldowns(char)
   tickCooldowns(char)
   assert.strictEqual(canUseAbility(char, card), true)
 })
