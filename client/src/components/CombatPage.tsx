import React, { useState } from 'react'
import CombatOverlay from './CombatOverlay'
import { useGameStore } from '../store/gameStore'
import GameView from './GameView'

interface Combatant { id: string; name: string; hp: number }

export default function CombatPage() {
  const party = useGameStore(state => state.party)
  const [players, setPlayers] = useState<Combatant[]>([])
  const [enemies, setEnemies] = useState<Combatant[]>([])
  const [log, setLog] = useState<string[]>([])

  const handleBattleEvent = (detail: any) => {
    if (detail.type === 'state') {
      setPlayers(detail.players)
      setEnemies(detail.enemies)
    } else if (detail.type === 'log') {
      setLog(l => [...l.slice(-10), detail.message])
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <GameView
        scene="battle"
        party={party?.characters || []}
        onBattleEvent={handleBattleEvent}
      />
      <CombatOverlay players={players} enemies={enemies} log={log} />
    </div>
  )
}
