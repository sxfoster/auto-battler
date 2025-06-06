import React from 'react'
import styles from './CombatOverlay.module.css'
import UnitCard from './UnitCard'

interface Combatant {
  id: string
  name: string
  hp: number
  maxHp?: number
  status?: string[]
}

interface Props {
  players: Combatant[]
  enemies: Combatant[]
  log: string[]
}

export default function CombatOverlay({ players, enemies, log }: Props) {
  return (
    <div className={styles.overlay}>
      <div className={styles.party}>
        {players.map(p => (
          <UnitCard
            key={p.id}
            unit={{
              id: p.id,
              name: p.name,
              hp: p.hp,
              maxHp: p.maxHp || 100,
              status: p.status,
            }}
            actionLabel="Stats"
            onAction={() => {
              /* placeholder for stats modal */
              console.log('View', p.name)
            }}
          />
        ))}
      </div>
      <div className={styles.enemies}>
        {enemies.map(e => (
          <UnitCard
            key={e.id}
            unit={{
              id: e.id,
              name: e.name,
              hp: e.hp,
              maxHp: e.maxHp || 100,
              status: e.status,
            }}
            actionLabel="Target"
            onAction={() => {
              console.log('Target', e.name)
            }}
          />
        ))}
      </div>
      <div className={styles.log} aria-live="polite">
        {log.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
    </div>
  )
}
