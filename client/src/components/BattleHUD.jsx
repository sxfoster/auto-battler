import React, { useEffect, useState, useRef } from 'react'
import { usePhaserScene } from '../hooks/usePhaserScene'
import CombatantCard from './CombatantCard'
import LogLine from './LogLine'
import Overlay from './Overlay'
import './BattleHUD.css'

export default function BattleHUD() {
  const scene = usePhaserScene('battle')
  const [order, setOrder] = useState([])
  const [combatants, setCombatants] = useState({})
  const combatantsRef = useRef({})
  const [activeId, setActiveId] = useState(null)
  const [log, setLog] = useState([])
  const [result, setResult] = useState(null)
  combatantsRef.current = combatants

  useEffect(() => {
    if (!scene) return

    const onInitialState = ({ order, combatants }) => {
      setOrder(order)
      setCombatants(combatants)
      combatantsRef.current = combatants
    }
    const onTurnStart = ({ actorId, currentEnergy, hand }) => {
      setActiveId(actorId)
      setCombatants(c => {
        const updated = {
          ...c,
          [actorId]: { ...c[actorId], currentEnergy, hand },
        }
        combatantsRef.current = updated
        return updated
      })
    }
    const onCardPlayed = ({ actorId, cardId, targetId, cost }) => {
      setCombatants(c => {
        const updated = {
          ...c,
          [actorId]: {
            ...c[actorId],
            currentEnergy: Math.max(0, (c[actorId]?.currentEnergy || 0) - (cost || 0)),
          },
        }
        combatantsRef.current = updated
        return updated
      })
      setLog(l => [
        ...l,
        `${combatantsRef.current[actorId]?.name || actorId} played ${cardId} on ${combatantsRef.current[targetId]?.name || targetId}`,
      ].slice(-20))
    }
    const onDamage = ({ targetId, amount }) => {
      setCombatants(c => {
        const updated = {
          ...c,
          [targetId]: {
            ...c[targetId],
            currentHp: Math.max(0, (c[targetId]?.currentHp || 0) - amount),
          },
        }
        combatantsRef.current = updated
        return updated
      })
    }
    const onHeal = ({ actorId, amount }) => {
      setCombatants(c => {
        const updated = {
          ...c,
          [actorId]: {
            ...c[actorId],
            currentHp: Math.min(c[actorId]?.maxHp || 0, (c[actorId]?.currentHp || 0) + amount),
          },
        }
        combatantsRef.current = updated
        return updated
      })
    }
    const onTurnSkipped = ({ actorId }) => {
      setLog(l => [...l, `${combatantsRef.current[actorId]?.name || actorId} skipped turn`].slice(-20))
    }
    const onBattleEnd = ({ result }) => setResult(result)

    scene.events.on('initial-state', onInitialState)
    scene.events.on('turn-start', onTurnStart)
    scene.events.on('card-played', onCardPlayed)
    scene.events.on('damage', onDamage)
    scene.events.on('heal', onHeal)
    scene.events.on('turn-skipped', onTurnSkipped)
    scene.events.on('battle-end', onBattleEnd)

    return () => {
      scene.events.off('initial-state', onInitialState)
      scene.events.off('turn-start',    onTurnStart)
      scene.events.off('card-played',   onCardPlayed)
      scene.events.off('damage',        onDamage)
      scene.events.off('heal',          onHeal)
      scene.events.off('turn-skipped',  onTurnSkipped)
      scene.events.off('battle-end',    onBattleEnd)
    }
  }, [scene])

  return React.createElement(
    'div',
    { className: 'battle-hud' },
    React.createElement(
      'div',
      { className: 'combatants allies' },
      order
        .filter(id => combatants[id]?.type === 'player')
        .map(id =>
          React.createElement(CombatantCard, {
            key: id,
            ...combatants[id],
            isActive: id === activeId,
          })
        )
    ),
    React.createElement(
      'section',
      { 'aria-live': 'polite', 'aria-relevant': 'additions', className: 'battle-log' },
      log.map((entry, i) => React.createElement(LogLine, { key: i, text: entry }))
    ),
    React.createElement(
      'div',
      { className: 'combatants enemies' },
      order
        .filter(id => combatants[id]?.type === 'enemy')
        .map(id =>
          React.createElement(CombatantCard, {
            key: id,
            ...combatants[id],
            isActive: id === activeId,
          })
        )
    ),
    result ? React.createElement(Overlay, { message: result }) : null
  )
}
