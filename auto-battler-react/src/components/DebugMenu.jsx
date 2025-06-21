import React from 'react'
import { useGameStore } from '../store.js'

export default function DebugMenu() {
  const { debugSkipToBattle, handleBattleComplete } = useGameStore(state => ({
    debugSkipToBattle: state.debugSkipToBattle,
    handleBattleComplete: state.handleBattleComplete,
  }))

  return (
    <div id="debug-menu">
      <h4 className="debug-title">Debug Menu</h4>
      <button className="debug-btn" onClick={debugSkipToBattle}>
        Skip to Battle
      </button>
      <button className="debug-btn" onClick={() => handleBattleComplete(true)}>
        Simulate Win
      </button>
      <button className="debug-btn" onClick={() => handleBattleComplete(false)}>
        Simulate Loss
      </button>
    </div>
  )
}
