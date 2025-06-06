import { test } from 'node:test'
import assert from 'assert'
import { applyBiomeBonuses, resetBiomeBonuses, getCurrentBiome } from './biome.js'
import { biomes } from '../models/biomes.js'

const dummyEnemy = {
  id: 'dummy',
  archetype: 'test',
  stats: { hp: 10, energy: 1, speed: 1 },
  deck: [],
  aiProfile: { behavior: 'aggressive', aggressiveness: 1 },
}

test('applyBiomeBonuses modifies stats', () => {
  const enemy = JSON.parse(JSON.stringify(dummyEnemy))
  const biome = biomes.find((b) => b.id === 'frozen-bastion')
  applyBiomeBonuses(biome, [enemy])
  assert.strictEqual(enemy.stats.speed, 2)
  resetBiomeBonuses([enemy])
  assert.strictEqual(enemy.stats.speed, 1)
})

test('getCurrentBiome returns matching biome', () => {
  const state = { currentBiome: 'inferno-ruins' }
  const biome = getCurrentBiome(state)
  assert.strictEqual(biome.id, 'inferno-ruins')
})
