import type { Item } from './Item'

export interface PlayerStatus {
  fatigue: number
  hunger: number
  thirst: number
}

export interface GameState {
  currentFloor: number
  dungeonDifficulty: number
  playerStatus: PlayerStatus
  inventory: Item[]
  location: 'dungeon' | 'town'
}
