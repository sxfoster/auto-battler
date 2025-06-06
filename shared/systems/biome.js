import { biomes } from '../models/biomes.js'
import { enemies as enemyData } from '../models/enemies.js'

/**
 * Apply all bonuses from a biome to a list of enemies.
 * @param {import('../models').Biome} biome
 * @param {import('../models').Enemy[]} enemies
 */
export function applyBiomeBonuses(biome, enemies) {
  if (!biome) return enemies; // Return original enemies if no biome

  return enemies.map((originalEnemy) => {
    // Deep clone the enemy only if bonuses haven't been applied yet
    // or if it's a fresh enemy object that doesn't have this flag.
    // This makes the mutation contained to the copy.
    const enemy = !originalEnemy.biomeBonusesApplied
      ? JSON.parse(JSON.stringify(originalEnemy))
      : originalEnemy;

    if (!enemy.biomeBonusesApplied) {
      // Store baseStats from the potentially cloned enemy's current stats
      enemy.baseStats = JSON.parse(JSON.stringify(enemy.stats));
    }

    // Ensure stats object exists
    if (!enemy.stats) {
      enemy.stats = {};
    }

    biome.bonuses.forEach((bonus) => {
      if (bonus.type === 'StatModifier') {
        const { stat, value } = bonus.effectDetails;
        if (stat && typeof value === 'number') {
          enemy.stats[stat] = (enemy.baseStats[stat] || 0) + value; // Apply bonus to base stat
        }
      } else {
        // Handle other types of bonuses, e.g., passive effects
        if (!enemy.activeBiomeEffects) enemy.activeBiomeEffects = [];
        // Avoid duplicating non-stackable effects if re-applying (though current logic avoids re-application)
        if (!enemy.activeBiomeEffects.find(eff => eff.id === bonus.id)) {
          enemy.activeBiomeEffects.push(bonus);
        }
      }
    });
    enemy.biomeBonusesApplied = true;
    return enemy; // Return the modified (potentially cloned) enemy
  });
}

/**
 * Remove biome bonuses from enemies, restoring original stats.
 * @param {import('../models').Enemy[]} enemies
 */
export function resetBiomeBonuses(enemies) {
  return enemies.map((originalEnemy) => {
    // Clone to avoid mutating the input array's objects directly if they are from a persistent state
    const enemy = JSON.parse(JSON.stringify(originalEnemy));

    if (enemy.biomeBonusesApplied && enemy.baseStats) {
      enemy.stats = JSON.parse(JSON.stringify(enemy.baseStats)); // Restore from deep copy of baseStats
    }
    // Clean up properties
    delete enemy.biomeBonusesApplied;
    delete enemy.baseStats;
    delete enemy.activeBiomeEffects;
    return enemy;
  });
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
    .map((e) => JSON.parse(JSON.stringify(e))) // Deep clone enemy templates

  let processedEnemies = enemies;
  if (biome) {
    processedEnemies = applyBiomeBonuses(biome, enemies);
  }
  return processedEnemies;
}
