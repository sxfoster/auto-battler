import React, { useEffect, useState } from 'react'
import { usePhaserScene } from '../hooks/usePhaserScene'
import CombatantCard from './CombatantCard'
import LogLine from './LogLine'
import Overlay from './Overlay'
import './BattleHUD.css'

export default function BattleHUD() {
  const scene = usePhaserScene('battle')
  const [order, setOrder] = useState([])
  const [combatants, setCombatants] = useState({})
  const [activeId, setActiveId] = useState(null)
  const [log, setLog] = useState([])
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (!scene) return

    const onInitialState = ({ order, combatants }) => {
      setOrder(order)
      setCombatants(combatants)
    }
    const onTurnStart = ({ actorId, currentEnergy, hand }) => {
      setActiveId(actorId)
      setCombatants(c => ({
        ...c,
        [actorId]: { ...c[actorId], currentEnergy, hand },
      }))
    }
    const onCardPlayed = ({ actorId, cardId, targetId, cost }) => {
      setCombatants(c => ({
        ...c,
        [actorId]: {
          ...c[actorId],
          currentEnergy: Math.max(0, (c[actorId]?.currentEnergy || 0) - (cost || 0)),
        },
      }))
      setLog(l => [
        ...l,
        `${combatants[actorId]?.name || actorId} played ${cardId} on ${combatants[targetId]?.name || targetId}`,
      ])
    }
    const onTurnSkipped = ({ actorId }) => {
      setLog(l => [...l, `${combatants[actorId]?.name || actorId} skipped turn`])
    }
    const onBattleEnd = ({ result }) => setResult(result)

    scene.events.on('initial-state', onInitialState)
    scene.events.on('turn-start', onTurnStart)
    scene.events.on('card-played', onCardPlayed)
    scene.events.on('turn-skipped', onTurnSkipped)
    scene.events.on('battle-end', onBattleEnd)

    scene.events.emit('request-state')

    return () => {
      scene.events.off('initial-state', onInitialState)
      scene.events.off('turn-start', onTurnStart)
      scene.events.off('card-played', onCardPlayed)
      scene.events.off('turn-skipped', onTurnSkipped)
      scene.events.off('battle-end', onBattleEnd)
    }
  }, [scene])

  return (
    <div className="battle-hud">
      <div className="combatants allies">
        {order
          .filter(id => combatants[id]?.type === 'player')
          .map(id => (
            <CombatantCard key={id} {...combatants[id]} isActive={id === activeId} />
          ))}
      </div>
      <div className="battle-log">
        {log.map((entry, i) => (
          <LogLine key={i} text={entry} />
        ))}
      </div>
      <div className="combatants enemies">
        {order
          .filter(id => combatants[id]?.type === 'enemy')
          .map(id => (
            <CombatantCard key={id} {...combatants[id]} isActive={id === activeId} />
          ))}
      </div>
      {result && <Overlay message={result} />}
    </div>
  )
}
