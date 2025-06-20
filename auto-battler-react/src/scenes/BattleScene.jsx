import React, { useEffect } from 'react'
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
            <Card key={c.id} item={c} view="compact" />
          ))}
        </div>
        <div className="enemy-team flex gap-2">
          {enemyCards.map(c => (
            <Card key={c.id} item={c} view="compact" />
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
    </div>
  )
}
