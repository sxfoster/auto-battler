import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameState } from '../GameStateProvider.jsx'

export default function TownView() {
  const navigate = useNavigate()
  const updateGameState = useGameState(s => s.updateGameState)
  const save = useGameState(s => s.save)

  const handleReturn = () => {
    updateGameState({ location: 'dungeon' })
    save()
    navigate('/dungeon')
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Town Hub</h2>
      <p>You may manage your inventory here. (placeholder)</p>
      <button onClick={handleReturn}>Return to Dungeon</button>
    </div>
  )
}
