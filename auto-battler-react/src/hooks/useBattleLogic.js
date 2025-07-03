import { useState, useRef, useCallback, useEffect } from 'react'
import GameEngine from '../game/engine.js'

function computeWinner(combatants = []) {
  const playerAlive = combatants.some(c => c.team === 'player' && c.currentHp > 0)
  const enemyAlive = combatants.some(c => c.team === 'enemy' && c.currentHp > 0)
  if (!playerAlive || !enemyAlive) return playerAlive ? 'player' : 'enemy'
  return null
}

export default function useBattleLogic(initialCombatants = [], options = {}, existingLog) {
  const engineRef = useRef(null)
  const iteratorRef = useRef(null)

  const [battleState, setBattleState] = useState(() =>
    (existingLog && existingLog[0]?.combatants)
      ? existingLog[0].combatants.map(c => ({ ...c }))
      : initialCombatants.map(c => ({ ...c }))
  )
  const [battleLog, setBattleLog] = useState(() => (existingLog && existingLog[0]?.log) ? [...existingLog[0].log] : [])
  const [isBattleOver, setIsBattleOver] = useState(() => (existingLog ? existingLog.length <= 1 : false))
  const [winner, setWinner] = useState(() => (existingLog && existingLog[0]?.combatants ? computeWinner(existingLog[0].combatants) : null))
  const [stepIndex, setStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(!existingLog)

  useEffect(() => {
    if (existingLog && existingLog.length > 0) {
      setBattleState(existingLog[0].combatants.map(c => ({ ...c })))
      setBattleLog(existingLog[0].log || [])
      setIsBattleOver(existingLog.length === 1)
      setWinner(computeWinner(existingLog[0].combatants))
      setStepIndex(0)
      engineRef.current = null
      iteratorRef.current = null
    } else {
      engineRef.current = new GameEngine(initialCombatants, options)
      iteratorRef.current = engineRef.current.runGameSteps()
      const first = iteratorRef.current.next().value
      if (first && first.combatants) {
        setBattleState(first.combatants)
        setBattleLog(first.log)
      } else {
        setBattleState(initialCombatants.map(c => ({ ...c })))
      }
      setIsBattleOver(engineRef.current.isBattleOver)
      setWinner(engineRef.current.winner)
      setStepIndex(0)
    }
  }, [initialCombatants, options, existingLog])

  const processTurn = useCallback(() => {
    if (existingLog) {
      if (stepIndex >= existingLog.length - 1) return
      const nextIndex = stepIndex + 1
      const step = existingLog[nextIndex]
      if (step.combatants) setBattleState(step.combatants)
      if (step.log) setBattleLog(log => [...log, ...step.log])
      setStepIndex(nextIndex)
      if (nextIndex === existingLog.length - 1) {
        setIsBattleOver(true)
        setWinner(computeWinner(step.combatants))
        setIsPlaying(false)
      }
      return
    }

    if (!iteratorRef.current || engineRef.current.isBattleOver) return
    const step = iteratorRef.current.next().value
    if (!step) return
    if (step.type === 'PAUSE') return
    if (step.combatants) setBattleState(step.combatants)
    if (step.log) setBattleLog(log => [...log, ...step.log])
    setIsBattleOver(engineRef.current.isBattleOver)
    setWinner(engineRef.current.winner)
    setStepIndex(i => i + 1)
  }, [existingLog, stepIndex])

  const play = () => setIsPlaying(true)
  const pause = () => setIsPlaying(false)

  return {
    battleState,
    battleLog,
    isBattleOver,
    winner,
    processTurn,
    play,
    pause,
    isPlaying,
    stepIndex,
    totalSteps: existingLog ? existingLog.length : null
  }
}
