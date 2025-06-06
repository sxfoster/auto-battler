import React, { createContext, useContext } from 'react'
import { useGameStore } from './store/gameStore'

const GameStateContext = createContext(null)

export const GameStateProvider = ({ children }) => {
  const store = useGameStore()
  return (
    <GameStateContext.Provider value={store}>{children}</GameStateContext.Provider>
  )
}

export const useGameState = () => {
  const ctx = useContext(GameStateContext)
  if (!ctx) {
    throw new Error('useGameState must be used within a GameStateProvider')
  }
  return ctx
}
