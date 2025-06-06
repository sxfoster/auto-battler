import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import type { Party } from '../../shared/models/Party'

interface GameState {
  party: Party | null
  setParty: (party: Party) => void
}

const GameContext = createContext<GameState | undefined>(undefined)

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [party, setPartyState] = useState<Party | null>(null)

  // Load party from localStorage once on mount to allow reloads
  useEffect(() => {
    const stored = localStorage.getItem('partyData')
    if (stored) {
      try {
        setPartyState(JSON.parse(stored))
      } catch {
        setPartyState(null)
      }
    }
  }, [])

  const setParty = (p: Party) => {
    setPartyState(p)
    // Persist for reloads
    localStorage.setItem('partyData', JSON.stringify(p))
  }

  return (
    <GameContext.Provider value={{ party, setParty }}>
      {children}
    </GameContext.Provider>
  )
}

export const useGame = () => {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be inside GameProvider')
  return ctx
}

