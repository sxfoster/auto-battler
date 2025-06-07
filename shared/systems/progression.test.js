import { test } from 'node:test'
import assert from 'assert'
import { handleAdvance } from './progression.js'

// Ensure deterministic biome and event selection
const origRandom = Math.random

function mockRandom() { return 0 }

function createState() {
  return {
    currentFloor: 1,
    dungeonDifficulty: 1,
    playerStatus: { fatigue: 0, hunger: 0, thirst: 0 },
    location: 'dungeon',
    currentBiome: 'fungal-depths',
    inventory: [],
    activeEvent: null,
  }
}

test('handleAdvance assigns an active event', () => {
  Math.random = mockRandom
  const state = createState()
  handleAdvance(state)
  Math.random = origRandom
  assert.ok(state.activeEvent, 'Active event should be assigned')
  if (state.activeEvent.biomeEligibility) {
    assert.ok(state.activeEvent.biomeEligibility.includes(state.currentBiome))
  }
})
