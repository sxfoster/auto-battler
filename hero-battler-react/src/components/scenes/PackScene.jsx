import React from 'react'
import Pack from '../ui/Pack'

export default function PackScene({ gameState, onOpen }) {
  // determine pack type from gameState
  const type = gameState.toLowerCase().split('_')[0]
  return (
    <div className="pack-scene">
      <Pack packType={type} onOpen={onOpen} />
    </div>
  )
}
