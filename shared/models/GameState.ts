export interface PlayerStatus {
  /** Level of fatigue accumulated while exploring */
  fatigue: number
  /** Hunger level */
  hunger: number
  /** Thirst level */
  thirst: number
}

export interface GameState {
  /** Current dungeon floor */
  currentFloor: number
  /** Difficulty scaling for the dungeon */
  dungeonDifficulty: number
  /** Active biome identifier */
  currentBiome: string
  /** Survival stats for the player or party */
  playerStatus: PlayerStatus
  /** Inventory items held */
  inventory: import('./LootItem').LootItem[]
  /** Current location */
  location: 'dungeon' | 'town'
}
