import type { GameState } from './models/GameState'

export const defaultGameState: GameState
export function loadGameState(): GameState
export function saveGameState(state: GameState): void
