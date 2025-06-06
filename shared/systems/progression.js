/**
 * Apply changes to the game state when the player chooses to advance.
 * @param {import('../models').GameState} state
 */
import { biomes } from '../models/biomes.js'

export function handleAdvance(state) {
  state.currentFloor += 1
  state.dungeonDifficulty += 1
  state.playerStatus.fatigue += 1
  state.playerStatus.hunger += 1
  state.playerStatus.thirst += 1
  state.location = 'dungeon'
  // cycle to a random biome when advancing floors
  const next = biomes[Math.floor(Math.random() * biomes.length)]
  state.currentBiome = next.id
}

/**
 * Reset progression and return to town when the player retreats.
 * @param {import('../models').GameState} state
 */
export function handleRetreat(state) {
  state.currentFloor = 1
  state.dungeonDifficulty = 1
  state.location = 'town'
  state.currentBiome = biomes[0].id
}

/**
 * Placeholder for presenting a decision UI in the host application.
 */
export function presentDecisionPoint() {
  // no-op implementation – games can override to display UI
}
