import React, { useEffect, useRef, useMemo, useCallback } from 'react'
import Card from '../components/Card.jsx'
import BattleLog from '../components/BattleLog.jsx'
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
  const lastLogIndex = useRef(0)

  const STATUS_ICONS = useMemo(() => ({
    Stun: 'fas fa-star',
    Poison: 'fas fa-skull-crossbones',
    Bleed: 'fas fa-droplet',
    Burn: 'fas fa-fire-alt',
    Slow: 'fas fa-hourglass-half',
    Confuse: 'fas fa-question',
    Root: 'fas fa-tree',
    Shock: 'fas fa-bolt',
    Vulnerable: 'fas fa-crosshairs',
    'Defense Down': 'fas fa-shield-slash',
    'Attack Up': 'fas fa-arrow-up',
    Fortify: 'fas fa-arrow-up',
    Regrowth: 'fas fa-leaf'
  }), [])

  const handleAttack = useCallback((attackerId, targetId, dmg) => {
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
  }, [])

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

  const flashStatusIcon = useCallback((targetEl, effect) => {
    const container = targetEl.querySelector('.status-icon-container')
    if (!container) return
    const iconClass = STATUS_ICONS[effect]?.replace(/\s+/g, '.')
    const icon = iconClass
      ? container.querySelector(`i.${iconClass}`)
      : null
    const holder = icon ? icon.parentElement : document.createElement('div')
    if (!icon) {
      holder.className = 'status-icon synergy-flash'
      holder.innerHTML = `<i class="${STATUS_ICONS[effect] || 'fas fa-star'}"></i>`
      container.appendChild(holder)
      setTimeout(() => holder.remove(), 600)
    } else {
      holder.classList.add('synergy-flash')
      setTimeout(() => holder.classList.remove('synergy-flash'), 600)
    }
  }, [STATUS_ICONS])

  const { battleState, battleLog, isBattleOver, winner, processTurn } =
    useBattleLogic(combatants, { onAttack: handleAttack })

  useEffect(() => {
    const newEntries = battleLog.slice(lastLogIndex.current)
    lastLogIndex.current = battleLog.length
    newEntries.forEach(entry => {
      const msg = entry.message || ''
      const type = entry.eventType || entry.type || ''

      if (type.toUpperCase() === 'DAMAGE_DEALT' || /hits .* for \d+ damage/.test(msg) || /takes \d+ damage/.test(msg)) {
        const m1 = msg.match(/^(.*?) hits (.*?) for (\d+) damage/)
        const m2 = msg.match(/^(.*?) takes (\d+) damage/)
        let attackerName, targetName, amount
        if (m1) {
          attackerName = m1[1]; targetName = m1[2]; amount = parseInt(m1[3], 10)
        } else if (m2) {
          attackerName = m2[1]; targetName = m2[1]; amount = parseInt(m2[2], 10)
        }
        if (attackerName && targetName) {
          const attacker = battleState.find(c => c.name === attackerName)
          const target = battleState.find(c => c.name === targetName)
          if (attacker && target) {
            handleAttack(attacker.id, target.id, amount)
          }
        }
      } else if (type.toUpperCase() === 'HEAL_APPLIED' || /heals .* for \d+/.test(msg) || /is healed for \d+/.test(msg)) {
        const m1 = msg.match(/^(.*?) heals (.*?) for (\d+)/)
        const m2 = msg.match(/^(.*?) heals for (\d+)/)
        const m3 = msg.match(/^(.*?) is healed for (\d+)/)
        let targetName, amount
        if (m1) { targetName = m1[2]; amount = parseInt(m1[3],10) }
        else if (m2) { targetName = m2[1]; amount = parseInt(m2[2],10) }
        else if (m3) { targetName = m3[1]; amount = parseInt(m3[2],10) }
        if (targetName) {
          const target = battleState.find(c => c.name === targetName)
          if (target) {
            const el = cardRefs.current[target.id]
            if (el) showCombatText(el, `+${amount}`, 'heal')
          }
        }
      } else if (type.toUpperCase() === 'STATUS_EFFECT_APPLIED' || /afflicted with|gains|suffers/.test(msg)) {
        if (/worn off/.test(msg)) return
        const targetName = msg.replace(/^\W+/, '').split(' ')[0]
        const effect = Object.keys(STATUS_ICONS).find(n => msg.includes(n))
        if (targetName && effect) {
          const target = battleState.find(c => c.name === targetName)
          if (target) {
            const el = cardRefs.current[target.id]
            if (el) flashStatusIcon(el, effect)
          }
        }
      }
    })
  }, [battleLog, battleState, STATUS_ICONS, flashStatusIcon, handleAttack])

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
      <BattleLog battleLog={battleLog} />
      {isBattleOver && (
        <div className="battle-result text-xl text-center mt-4">
          {winner === 'player' ? 'Victory!' : 'Defeat!'}
        </div>
      )}
    </div>
  )
}
