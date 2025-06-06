import { biomes } from '../models/biomes.js'
import { enemies as enemyData } from '../models/enemies.js'

/**
 * Applies all bonuses from a given biome to a list of enemies.
 * This function deep clones enemies if bonuses haven't been applied yet,
 * stores their base stats, and then applies stat modifiers and other effects.
 * It marks enemies with `biomeBonusesApplied = true` after processing.
 *
 * @param {import('../models').Biome} biome - The biome object containing the bonuses to apply.
 * @param {import('../models').Enemy[]} enemies - An array of enemy objects to modify.
 * @returns {import('../models').Enemy[]} The array of enemies with biome bonuses applied. Returns original enemies if no biome is provided.
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
 * Removes biome bonuses from a list of enemies, restoring their original stats
 * from `baseStats` if available. It also cleans up properties related to biome effects.
 * This function clones enemies to avoid mutating the input array's objects directly.
 *
 * @param {import('../models').Enemy[]} enemies - An array of enemy objects to reset.
 * @returns {import('../models').Enemy[]} The array of enemies with biome bonuses removed and stats reset.
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
 * Retrieves the biome object corresponding to the current biome ID in the game state.
 * If the current biome ID is not found, it defaults to the first biome in the `biomes` array.
 *
 * @param {import('../models').GameState} state - The current game state object, which includes `currentBiome` ID.
 * @returns {import('../models').Biome} The biome object for the current game state.
 */
export function getCurrentBiome(state) {
  return biomes.find((b) => b.id === state.currentBiome) || biomes[0]
}

/**
 * Spawns enemies for a given floor or encounter configuration.
 * It finds the biome associated with the floor, retrieves enemy templates based on `enemyTypes`,
 * deep clones these templates, and then applies biome bonuses to the spawned enemies.
 *
 * @param {import('../models').Encounter} floor - The floor or encounter object, containing biome ID and enemy types.
 * @returns {import('../models').Enemy[]} An array of enemy objects, processed with biome bonuses, ready for the encounter.
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
