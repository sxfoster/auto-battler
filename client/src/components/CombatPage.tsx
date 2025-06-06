import React, { useState } from 'react'
import CombatOverlay from './CombatOverlay'
import { useGameStore } from '../store/gameStore'
import GameView from './GameView'
import { useModal } from './ModalManager.jsx'
import { useNotification } from './NotificationManager.jsx'
import { useNavigate } from 'react-router-dom'

interface Combatant { id: string; name: string; hp: number }

export default function CombatPage() {
  const party = useGameStore(state => state.party)
  const [players, setPlayers] = useState<Combatant[]>([])
  const [enemies, setEnemies] = useState<Combatant[]>([])
  const [hand, setHand] = useState<any[]>([])
  const [turn, setTurn] = useState(0)
  const [active, setActive] = useState<string | null>(null)
  const [log, setLog] = useState<string[]>([])
  const { open, close } = useModal()
  const { notify } = useNotification()
  const navigate = useNavigate()

  const handleBattleEvent = (detail: any) => {
    if (detail.type === 'state') {
      setPlayers(detail.players)
      setEnemies(detail.enemies)
      setHand(detail.hand || [])
      setTurn(detail.turn)
      setActive(detail.current || null)
    } else if (detail.type === 'log') {
      setLog(l => [...l.slice(-10), detail.message])
    }
  }

  const playCard = (id: string) => {
    window.dispatchEvent(
      new CustomEvent('battleCommand', { detail: { action: 'playCard', cardId: id } }),
    )
  }

  const endTurn = () => {
    window.dispatchEvent(
      new CustomEvent('battleCommand', { detail: { action: 'endTurn' } }),
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      <GameView
        scene="battle"
        party={party?.characters || []}
        onBattleEvent={handleBattleEvent}
      />
        <CombatOverlay
          players={players}
          enemies={enemies}
          hand={hand}
          log={log}
          turn={turn}
          active={active}
          onPlayCard={playCard}
          onEndTurn={endTurn}
        />
      <button
        style={{ position: 'absolute', top: 10, right: 10 }}
        onClick={() => {
          const id = open(
            <div>
              <p>Retreat from battle?</p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  onClick={() => {
                    close(id)
                    notify('You retreated to safety.', 'success')
                    navigate('/dungeon')
                  }}
                >
                  Yes
                </button>
                <button onClick={() => close(id)}>No</button>
              </div>
            </div>
          )
        }}
      >
        Retreat
      </button>
    </div>
  )
}
