import { test } from 'node:test'
import assert from 'assert'
import { canUseCard, applyRolePenalty, applyClassSynergy } from './classRole.js'

const warrior = { id: 'w', name: 'Warrior', class: 'Warrior', stats: { hp: 10, energy: 3 }, deck: [], survival: { hunger:0, thirst:0, fatigue:0 } }
const strike = { id: 'strike', name: 'Strike', category: 'Ability', rarity: 'Common', energyCost:1, cooldown:0, effect:{ type:'damage', magnitude: 8 }, roleTag:'DPS' }

test('canUseCard false when role mismatch', () => {
  assert.strictEqual(canUseCard(warrior, strike), false)
})

test('applyRolePenalty reduces magnitude', () => {
  const result = applyRolePenalty(strike, warrior)
  assert.strictEqual(result.magnitude, 2)
})

test('applyClassSynergy activates for class match', () => {
  const card = { ...strike, classRestriction: 'Warrior', synergyEffect: { type:'damage', magnitude:2 } }
  assert.deepStrictEqual(applyClassSynergy(card, warrior), { type:'damage', magnitude:2 })
})
