import { test } from 'node:test'
import assert from 'assert'
import { canUseCard, applyRolePenalty, applyClassSynergy } from './classRole.js'

const warrior = { id: 'w', name: 'Warrior', class: 'warrior', stats: { hp: 10, energy: 3 }, deck: [], survival: { hunger:0, thirst:0, fatigue:0 } }
const strike = { id: 'strike', name: 'Strike', category: 'Ability', rarity: 'Common', energyCost:1, cooldown:0, effect:{ type:'damage', magnitude: 8 }, roleTag:'DPS' }

const sentinel = { id: 's', name: 'Runestone Sentinel', class: 'runestone-sentinel', stats: { hp: 10, energy: 3 }, deck: [], survival: { hunger:0, thirst:0, fatigue:0 } }
const stoneGuard = { id: 'stone_guard', name: 'Stone Guard', category: 'Ability', rarity: 'Common', energyCost:1, cooldown:0, effect:{ type:'buff', magnitude: 2, duration:3 }, roleTag:'Tank', classRestriction: 'runestone-sentinel' }

const warden = { id: 'tw', name: 'Totem Warden', class: 'totem-warden', stats: { hp: 10, energy: 3 }, deck: [], survival: { hunger:0, thirst:0, fatigue:0 } }
const totem = { id: 'totem_of_vitality', name: 'Totem of Vitality', category: 'Ability', rarity: 'Common', energyCost:2, cooldown:2, effect:{ type:'heal', magnitude:1 }, roleTag:'Support', classRestriction: 'totem-warden' }

test('canUseCard false when role mismatch', () => {
  assert.strictEqual(canUseCard(warrior, strike), false)
})

test('applyRolePenalty reduces magnitude', () => {
  const result = applyRolePenalty(strike, warrior)
  assert.strictEqual(result.magnitude, 2)
})

test('applyClassSynergy activates for class match', () => {
  const card = { ...strike, classRestriction: 'warrior', synergyEffect: { type:'damage', magnitude:2 } }
  assert.deepStrictEqual(applyClassSynergy(card, warrior), { type:'damage', magnitude:2 })
})

test('canUseCard works for Runestone Sentinel with id-based lookup', () => {
  assert.strictEqual(canUseCard(sentinel, stoneGuard), true)
})

test('Totem Warden can use its own cards', () => {
  assert.strictEqual(canUseCard(warden, totem), true)
})
