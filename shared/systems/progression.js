import { biomes } from '../models/biomes.js'
import { assignRandomEventToFloor } from './floorEvents.js'
import { dungeonEvents } from '../models/events.js'

/**
 * Applies changes to the game state when the player chooses to advance to the next floor.
 * Increments floor number, difficulty, and player's survival penalties (fatigue, hunger, thirst).
 * Sets location to 'dungeon', selects a random new biome, and assigns a random event to the game state.
 *
 * @param {import('../models').GameState} state - The current game state object. This object is mutated.
 */
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
  assignRandomEventToFloor(state, dungeonEvents)
}

/**
 * Resets progression-related game state when the player chooses to retreat to town.
 * Resets current floor and dungeon difficulty to 1, sets location to 'town',
 * sets the biome to the default (first biome), and clears any active event.
 *
 * @param {import('../models').GameState} state - The current game state object. This object is mutated.
 */
export function handleRetreat(state) {
  state.currentFloor = 1
  state.dungeonDifficulty = 1
  state.location = 'town'
  state.currentBiome = biomes[0].id
  state.activeEvent = null
}

/**
 * Placeholder function for presenting a decision point UI in the host application.
 * This function is a no-op in the shared systems but can be overridden by the game
 * implementation to display relevant UI choices to the player.
 */
export function presentDecisionPoint() {
  // no-op implementation – games can override to display UI
}
