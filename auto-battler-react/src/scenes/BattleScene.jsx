import React, { useEffect } from 'react'
import Card from '../components/Card.jsx'
import useBattleLogic from '../hooks/useBattleLogic.js'
import { useGameStore } from '../stores/useGameStore.js'

export default function BattleScene({ turnDelay = 1000 }) {
  const { battleState, battleLog, nextTurn, isBattleOver, activeCombatantId } = useBattleLogic()
  const handleBattleComplete = useGameStore(state => state.handleBattleComplete)

  useEffect(() => {
    if (isBattleOver) {
      const id = setTimeout(() => handleBattleComplete(), 500)
      return () => clearTimeout(id)
    }
    const timer = setTimeout(() => nextTurn(), turnDelay)
    return () => clearTimeout(timer)
  }, [nextTurn, isBattleOver, turnDelay, handleBattleComplete])

  const playerTeam = battleState.filter(c => c.team === 'player')
  const enemyTeam = battleState.filter(c => c.team === 'enemy')

  return (
    <div className="battle-scene">
      <div className="battle-arena">
        <div className="team-container" id="player-team-container">
          {playerTeam.map(c => (
            <Card key={c.id} data={c} view="compact" isActive={c.id === activeCombatantId} isTakingDamage={c.isTakingDamage} />
          ))}
        </div>
        <div className="team-container" id="enemy-team-container">
          {enemyTeam.map(c => (
            <Card key={c.id} data={c} view="compact" isActive={c.id === activeCombatantId} isTakingDamage={c.isTakingDamage} />
          ))}
        </div>
      </div>
      <div id="battle-log-container">
        <div id="battle-log-panel" className="expanded">
          {battleLog.map((entry, i) => (
            <div key={i} className="log-entry">{entry}</div>
          ))}
        </div>
      </div>
      {isBattleOver && (
        <div id="end-screen" className="visible">
          <div id="end-screen-result-text">Battle Complete</div>
        </div>
      )}
    </div>
  )
}
