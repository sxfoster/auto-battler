import { test } from 'node:test'
import assert from 'assert'
import { assignRandomEventToFloor, applyEventEffects } from './floorEvents.js'
import { dungeonEvents } from '../models/events.js'

test('assignRandomEventToFloor picks eligible event', () => {
  const floor = { biome: 'fungal-depths', activeEvent: null }
  assignRandomEventToFloor(floor, dungeonEvents)
  assert.ok(floor.activeEvent)
  if (floor.activeEvent.biomeEligibility) {
    assert.ok(floor.activeEvent.biomeEligibility.includes('fungal-depths'))
  }
})

test('applyEventEffects missChance cancels', () => {
  const event = {
    name: 'Test',
    description: '',
    effectType: 'missChance',
    effectDetails: { chance: 1 },
    duration: 'floor',
  }
  const ctx = { phase: 'beforeCard' }
  applyEventEffects(event, ctx)
  assert.strictEqual(ctx.cancel, true)
})
