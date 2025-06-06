import React from 'react'
import styles from './CombatOverlay.module.css'

interface Combatant {
  id: string
  name: string
  hp: number
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
          <div key={p.id} className={styles.combatant}>
            <strong>{p.name}</strong>
            <div className={styles.bar}>
              <span style={{ width: `${p.hp}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className={styles.enemies}>
        {enemies.map(e => (
          <div key={e.id} className={styles.combatant}>
            <strong>{e.name}</strong>
            <div className={styles.bar}>
              <span style={{ width: `${e.hp}%` }} />
            </div>
          </div>
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
