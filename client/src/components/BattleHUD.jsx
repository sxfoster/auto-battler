import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePhaserScene } from '../hooks/usePhaserScene'
import CombatantCard from './CombatantCard'
import LogLine from './LogLine'
import Overlay from './Overlay'

export default function BattleHUD() {
  const scene = usePhaserScene('battle')
  const navigate = useNavigate()
  const [turnOrder, setTurnOrder] = useState([])
  const [combatants, setCombatants] = useState({})
  const [log, setLog] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [battleResult, setBattleResult] = useState(null)

  useEffect(() => {
    if (!scene) return

    const updateTurnStart = ({ actorId, newEnergy, hand }) => {
      setActiveId(actorId)
      setCombatants(prev => {
        const next = { ...prev }
        if (next[actorId]) {
          next[actorId] = { ...next[actorId], energy: newEnergy, hand }
        }
        return next
      })
    }

    const updateCardPlayed = (payload) => {
      setCombatants(prev => {
        const next = { ...prev }
        if (payload.damage && next[payload.targetId]) {
          const t = next[payload.targetId]
          next[payload.targetId] = { ...t, hp: Math.max(0, t.hp - payload.damage) }
        }
        if (payload.heal && next[payload.actorId]) {
          const a = next[payload.actorId]
          next[payload.actorId] = { ...a, hp: Math.min(a.maxHp, a.hp + payload.heal) }
        }
        return next
      })
    }

    const updateSkip = ({ actorId }) => {
      setLog(l => [...l, { type: 'skip', actorId }])
    }

    const updateBattleEnd = ({ result }) => {
      setBattleResult(result)
    }

    const logHandler = (entry) => {
      setLog(l => [...l.slice(-19), { type: 'text', text: entry }])
    }

    scene.events.on('turn-start', updateTurnStart)
    scene.events.on('card-played', updateCardPlayed)
    scene.events.on('turn-skipped', updateSkip)
    scene.events.on('battle-end', updateBattleEnd)
    scene.events.on('battle-log', logHandler)

    if (scene.turnOrder) {
      const order = scene.turnOrder.map(c => c.data.id)
      const map = {}
      scene.turnOrder.forEach(c => {
        map[c.data.id] = {
          id: c.data.id,
          type: c.type,
          name: c.data.name,
          portraitUrl: c.data.portrait,
          hp: c.hp,
          maxHp: c.data.stats.hp,
          energy: c.energy ?? c.data.currentEnergy ?? 0,
        }
      })
      setTurnOrder(order)
      setCombatants(map)
    }

    return () => {
      scene.events.off('turn-start', updateTurnStart)
      scene.events.off('card-played', updateCardPlayed)
      scene.events.off('turn-skipped', updateSkip)
      scene.events.off('battle-end', updateBattleEnd)
      scene.events.off('battle-log', logHandler)
    }
  }, [scene])

  return (
    <div className="battle-hud">
      <div className="combatants allies">
        {turnOrder.filter(id => combatants[id]?.type === 'player').map(id => (
          <CombatantCard key={id} data={combatants[id]} isActive={id === activeId} />
        ))}
      </div>
      <div className="battle-log">
        {log.map((entry, i) => (
          <LogLine key={i} {...entry} />
        ))}
      </div>
      <div className="combatants enemies">
        {turnOrder.filter(id => combatants[id]?.type === 'enemy').map(id => (
          <CombatantCard key={id} data={combatants[id]} isActive={id === activeId} />
        ))}
      </div>
      {battleResult && (
        <Overlay message={battleResult} onContinue={() => navigate('/town')} />
      )}
    </div>
  )
}
