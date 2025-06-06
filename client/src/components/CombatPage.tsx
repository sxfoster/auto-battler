import React, { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'
import BattleScene from '../phaser/BattleScene'
import CombatOverlay from './CombatOverlay'
import type { Card } from '../../../shared/models/Card'

interface Combatant { id: string; name: string; hp: number }

export default function CombatPage() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [players, setPlayers] = useState<Combatant[]>([])
  const [enemies, setEnemies] = useState<Combatant[]>([])
  const [log, setLog] = useState<string[]>([])

  useEffect(() => {
    if (!containerRef.current) return
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: containerRef.current,
      scene: [BattleScene],
    })
    const handler = (e: any) => {
      if (e.detail.type === 'state') {
        setPlayers(e.detail.players)
        setEnemies(e.detail.enemies)
      } else if (e.detail.type === 'log') {
        setLog(l => [...l.slice(-10), e.detail.message])
      }
    }
    window.addEventListener('battleState', handler)
    return () => {
      window.removeEventListener('battleState', handler)
      game.destroy(true)
    }
  }, [])

  return (
    <div style={{ position: 'relative' }}>
      <div ref={containerRef} />
      <CombatOverlay players={players} enemies={enemies} log={log} />
    </div>
  )
}
