import React, { useEffect, useRef, useMemo } from 'react'
import PropTypes from 'prop-types'
import Card from '../components/Card.jsx'
import BattleLog from '../components/BattleLog.jsx'
import useBattleLogic from '../hooks/useBattleLogic.js'
import { useGameStore } from '../store.js'

export default function BattleScene({ storedLog = [] }) {
  const { combatants, startBattle, handleBattleComplete } = useGameStore(state => ({
    combatants: state.combatants,
    startBattle: state.startBattle,
    handleBattleComplete: state.handleBattleComplete,
  }))

  const finalCombatants = useMemo(() => {
    if (storedLog.length) {
      const entry = [...storedLog].reverse().find(e => e.combatants)
      if (entry) return entry.combatants
    }
    return combatants
  }, [storedLog, combatants])

  useEffect(() => {
    if (!hasStoredLog && !combatants.length) startBattle()
  }, [combatants, startBattle, hasStoredLog])

  const sceneRef = useRef(null)
  const cardRefs = useRef({})

  const handleAttack = (attackerId, targetId, dmg) => {
    const attackerEl = cardRefs.current[attackerId]
    const targetEl = cardRefs.current[targetId]
    if (!attackerEl || !targetEl) return

    attackerEl.classList.add('is-attacking')
    setTimeout(() => attackerEl.classList.remove('is-attacking'), 400)

    targetEl.classList.add('is-taking-damage')
    setTimeout(() => targetEl.classList.remove('is-taking-damage'), 400)

    spawnProjectile(attackerEl, targetEl)
    createHitSpark(targetEl)
    showCombatText(targetEl, `-${dmg}`, 'damage')
  }

  const spawnProjectile = (startEl, endEl) => {
    if (!sceneRef.current) return
    const projectile = document.createElement('div')
    projectile.className = 'battle-projectile'
    sceneRef.current.appendChild(projectile)

    const s = startEl.getBoundingClientRect()
    const e = endEl.getBoundingClientRect()
    const startX = s.left + s.width / 2
    const startY = s.top + s.height / 2
    const endX = e.left + e.width / 2
    const endY = e.top + e.height / 2
    projectile.style.left = `${startX}px`
    projectile.style.top = `${startY}px`
    requestAnimationFrame(() => {
      projectile.style.transform = `translate(${endX - startX}px, ${endY - startY}px)`
    })
    projectile.addEventListener('transitionend', () => projectile.remove())
  }

  const createHitSpark = (targetEl) => {
    if (!sceneRef.current) return
    const rect = targetEl.getBoundingClientRect()
    const spark = document.createElement('div')
    spark.className = 'hit-spark'
    spark.style.left = `${rect.left + rect.width / 2}px`
    spark.style.top = `${rect.top + rect.height / 2}px`
    sceneRef.current.appendChild(spark)
    setTimeout(() => spark.remove(), 300)
  }

  const showCombatText = (targetEl, text, type) => {
    const popup = document.createElement('div')
    popup.className = `combat-text-popup ${type}`
    popup.textContent = text
    targetEl.appendChild(popup)
    setTimeout(() => popup.remove(), 1200)
  }

  const { battleState, battleLog, isBattleOver, winner, processTurn } =
    useBattleLogic(combatants, { onAttack: handleAttack })

  const hasStoredLog = storedLog.length > 0
  const displayState = hasStoredLog ? finalCombatants : battleState
  const displayLog = useMemo(
    () => hasStoredLog
      ? storedLog.flatMap(e => e.log || [])
      : battleLog,
    [hasStoredLog, storedLog, battleLog]
  )
  const battleWinner = useMemo(() => {
    if (hasStoredLog) {
      const playersAlive = finalCombatants.some(c => c.team === 'player' && c.currentHp > 0)
      const enemiesAlive = finalCombatants.some(c => c.team === 'enemy' && c.currentHp > 0)
      if (playersAlive && !enemiesAlive) return 'player'
      if (enemiesAlive && !playersAlive) return 'enemy'
      return null
    }
    return winner
  }, [hasStoredLog, finalCombatants, winner])

  useEffect(() => {
    if (!hasStoredLog && !isBattleOver) {
      const timer = setTimeout(processTurn, 1000)
      return () => clearTimeout(timer)
    }
  }, [battleLog, isBattleOver, processTurn, hasStoredLog])

  useEffect(() => {
    if (!hasStoredLog && isBattleOver) {
      handleBattleComplete(winner === 'player')
    }
  }, [isBattleOver, winner, handleBattleComplete, hasStoredLog])

  const playerCards = displayState.filter(c => c.team === 'player')
  const enemyCards = displayState.filter(c => c.team === 'enemy')

  return (
    <div className="battle-scene" ref={sceneRef}>
      <div className="teams flex justify-between mb-4">
        <div className="player-team flex gap-2">
          {playerCards.map(c => (
            <Card
              key={c.id}
              ref={el => { cardRefs.current[c.id] = el }}
              item={c}
              view="compact"
            />
          ))}
        </div>
        <div className="enemy-team flex gap-2">
          {enemyCards.map(c => (
            <Card
              key={c.id}
              ref={el => { cardRefs.current[c.id] = el }}
              item={c}
              view="compact"
            />
          ))}
        </div>
      </div>
      <BattleLog battleLog={displayLog} />
      {(hasStoredLog || isBattleOver) && (
        <div className="battle-result text-xl text-center mt-4">
          {battleWinner === 'player' ? 'Victory!' : 'Defeat!'}
        </div>
      )}
    </div>
  )
}

BattleScene.propTypes = {
  storedLog: PropTypes.array,
}
