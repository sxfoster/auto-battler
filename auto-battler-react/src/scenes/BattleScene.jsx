import React, { useEffect, useState } from 'react'
import Card from '../components/Card.jsx'
import useBattleLogic from '../hooks/useBattleLogic.js'
import { useGameStore } from '../store.js'

export default function BattleScene() {
  const { combatants, startBattle, handleBattleComplete } = useGameStore(state => ({
    combatants: state.combatants,
    startBattle: state.startBattle,
    handleBattleComplete: state.handleBattleComplete,
  }))

  useEffect(() => {
    if (!combatants.length) startBattle()
  }, [combatants, startBattle])

  const { battleState, battleLog, isBattleOver, winner, processTurn } =
    useBattleLogic(combatants)

  const [tooltip, setTooltip] = useState(null)

  const showTooltip = (e, data) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setTooltip({
      x: rect.left + rect.width / 2,
      y: rect.top,
      ...data
    })
  }

  const hideTooltip = () => setTooltip(null)

  useEffect(() => {
    if (!isBattleOver) {
      const timer = setTimeout(processTurn, 1000)
      return () => clearTimeout(timer)
    }
  }, [battleLog, isBattleOver, processTurn])

  useEffect(() => {
    if (isBattleOver) {
      handleBattleComplete(winner === 'player')
    }
  }, [isBattleOver, winner, handleBattleComplete])

  const playerCards = battleState.filter(c => c.team === 'player')
  const enemyCards = battleState.filter(c => c.team === 'enemy')

  return (
    <div className="battle-scene">
      <div className="teams flex justify-between mb-4">
        <div className="player-team flex gap-2">
          {playerCards.map(c => (
            <Card
              key={c.id}
              item={c}
              view="compact"
              onStatusHover={showTooltip}
              onStatusOut={hideTooltip}
            />
          ))}
        </div>
        <div className="enemy-team flex gap-2">
          {enemyCards.map(c => (
            <Card
              key={c.id}
              item={c}
              view="compact"
              onStatusHover={showTooltip}
              onStatusOut={hideTooltip}
            />
          ))}
        </div>
      </div>
      <div className="battle-log text-sm">
        {battleLog.map((msg, idx) => (
          <p key={idx}>{msg}</p>
        ))}
      </div>
      {isBattleOver && (
        <div className="battle-result text-xl text-center mt-4">
          {winner === 'player' ? 'Victory!' : 'Defeat!'}
        </div>
      )}
      <div
        className={`status-tooltip ${tooltip ? 'visible' : ''}`}
        style={tooltip ? { left: tooltip.x + 10, top: tooltip.y + 10 } : {}}
      >
        {tooltip && (
          <>
            <h4 className="status-tooltip-name">{tooltip.name}</h4>
            <p className="status-tooltip-duration">
              Turns remaining: {tooltip.turns}
            </p>
            {tooltip.description && (
              <p className="status-tooltip-description">{tooltip.description}</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
