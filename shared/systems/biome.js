import { biomes } from '../models/biomes.js'
import { enemies as enemyData } from '../models/enemies.js'

/**
 * Apply all bonuses from a biome to a list of enemies.
 * @param {import('../models').Biome} biome
 * @param {import('../models').Enemy[]} enemies
 */
export function applyBiomeBonuses(biome, enemies) {
  if (!biome) return
  enemies.forEach((enemy) => {
    if (!enemy.biomeBonusesApplied) {
      enemy.baseStats = { ...enemy.stats }
    }
    biome.bonuses.forEach((bonus) => {
      if (bonus.type === 'StatModifier') {
        const { stat, value } = bonus.effectDetails
        if (stat && typeof value === 'number') {
          enemy.stats[stat] = (enemy.stats[stat] || 0) + value
        }
      } else {
        if (!enemy.activeBiomeEffects) enemy.activeBiomeEffects = []
        enemy.activeBiomeEffects.push(bonus)
      }
    })
    enemy.biomeBonusesApplied = true
  })
}

/**
 * Remove biome bonuses from enemies, restoring original stats.
 * @param {import('../models').Enemy[]} enemies
 */
export function resetBiomeBonuses(enemies) {
  enemies.forEach((enemy) => {
    if (enemy.biomeBonusesApplied && enemy.baseStats) {
      enemy.stats = { ...enemy.baseStats }
    }
    delete enemy.biomeBonusesApplied
    delete enemy.baseStats
    delete enemy.activeBiomeEffects
  })
}

/**
 * Get the biome object for the current game state.
 * @param {import('../models').GameState} state
 */
export function getCurrentBiome(state) {
  return biomes.find((b) => b.id === state.currentBiome) || biomes[0]
}

/**
 * Spawn enemies for a floor/encounter and apply biome bonuses.
 * @param {import('../models').Encounter} floor
 * @returns {import('../models').Enemy[]}
 */
export function spawnEnemiesForFloor(floor) {
  const biome = biomes.find((b) => b.id === floor.biome)
  const enemies = floor.enemyTypes
    .map((t) => enemyData.find((e) => e.id === t))
    .filter(Boolean)
    .map((e) => JSON.parse(JSON.stringify(e)))
  if (biome) applyBiomeBonuses(biome, enemies)
  return enemies
}
