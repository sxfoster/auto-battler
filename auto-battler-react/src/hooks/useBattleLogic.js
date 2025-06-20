import { useState, useCallback } from 'react'

export default function useBattleLogic(initialState = []) {
  const [battleState, setBattleState] = useState(initialState)
  const [battleLog, setBattleLog] = useState([])
  const [isBattleOver, setBattleOver] = useState(false)
  const [activeCombatantId, setActiveCombatantId] = useState(null)

  const nextTurn = useCallback(() => {
    setBattleLog(log => [...log, 'Next turn'])
    setActiveCombatantId(prev => {
      if (!battleState.length) return null
      const currentIndex = battleState.findIndex(c => c.id === prev)
      const nextIndex = (currentIndex + 1) % battleState.length
      return battleState[nextIndex].id
    })
  }, [battleState])

  return {
    battleState,
    battleLog,
    nextTurn,
    isBattleOver,
    activeCombatantId,
  }
}
