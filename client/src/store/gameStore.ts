import { create } from 'zustand'
import type { Party } from '../../shared/models/Party'
import type { GameState } from '../../shared/models/GameState'
import type { DungeonData } from '../utils/generateDungeon'
import type { DungeonMap } from '../../shared/models/DungeonMap'
import type { Role } from '../../shared/models/Card'

const defaultState: GameState = {
  currentFloor: 1,
  dungeonDifficulty: 1,
  currentBiome: 'fungal-depths',
  playerStatus: { fatigue: 0, hunger: 0, thirst: 0 },
  inventory: [],
  location: 'town',
  activeEvent: null,
}

interface Store {
  party: Party | null
  setParty: (party: Party) => void

  gameState: GameState
  setGameState: (state: GameState) => void
  updateGameState: (partial: Partial<GameState>) => void

  dungeon: DungeonData | null
  setDungeon: (dungeon: DungeonData) => void
  dungeonMap: DungeonMap | null
  setDungeonMap: (map: DungeonMap) => void
  currentRoom: string | null
  setCurrentRoom: (id: string) => void
  playerPos: { x: number; y: number } | null
  setPlayerPos: (pos: { x: number; y: number }) => void
  explored: Set<string>
  setExplored: (explored: Set<string>) => void

  availableClasses: { name: string; description: string; role: Role; allowedCards: string[] }[]
  setAvailableClasses: (
    classes: { name: string; description: string; role: Role; allowedCards: string[] }[],
  ) => void

  save: () => void
  load: () => void
}

export const useGameStore = create<Store>((set, get) => ({
  party: null,
  setParty: (party) => set({ party }),

  gameState: defaultState,
  setGameState: (state) => set({ gameState: state }),
  updateGameState: (partial) =>
    set({ gameState: { ...get().gameState, ...partial } }),

  dungeon: null,
  setDungeon: (dungeon) => set({ dungeon }),
  dungeonMap: null,
  setDungeonMap: (map) => set({ dungeonMap: map }),
  currentRoom: null,
  setCurrentRoom: (id) => set({ currentRoom: id }),
  playerPos: null,
  setPlayerPos: (pos) => set({ playerPos: pos }),
  explored: new Set<string>(),
  setExplored: (explored) => set({ explored }),

  availableClasses: [],
  setAvailableClasses: (classes) => set({ availableClasses: classes }),

  save: () => {
    const {
      party,
      gameState,
      dungeon,
      dungeonMap,
      currentRoom,
      playerPos,
      explored,
      availableClasses,
    } = get()
    const data = {
      party,
      gameState,
      dungeon,
      dungeonMap,
      currentRoom,
      playerPos,
      explored: Array.from(explored),
      availableClasses,
    }
    localStorage.setItem('gameData', JSON.stringify(data))
  },
  load: () => {
    const raw = localStorage.getItem('gameData')
    if (!raw) return
    try {
      const data = JSON.parse(raw)
      set({
        party: data.party ?? null,
        gameState: data.gameState ?? defaultState,
        dungeon: data.dungeon ?? null,
        dungeonMap: data.dungeonMap ?? null,
        currentRoom: data.currentRoom ?? null,
        playerPos: data.playerPos ?? null,
        explored: new Set<string>(data.explored || []),
        availableClasses: data.availableClasses ?? [],
      })
    } catch (e) {
      console.error('Failed to load game data', e)
    }
  },
}))
