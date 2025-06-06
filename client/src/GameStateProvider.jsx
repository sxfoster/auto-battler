import React, { createContext, useContext } from 'react'
import { useGameStore } from './store/gameStore'

const GameStateContext = createContext(null)

export const GameStateProvider = ({ children }) => {
  // Provide the useGameStore hook itself so consumers can select slices
  return (
    <GameStateContext.Provider value={useGameStore}>
      {children}
    </GameStateContext.Provider>
  )
}

export const useGameState = selector => {
  const useStore = useContext(GameStateContext)
  if (!useStore) {
    throw new Error('useGameState must be used within a GameStateProvider')
  }
  return useStore(selector)
}
