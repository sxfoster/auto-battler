import React, { useEffect, useRef } from 'react'
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
