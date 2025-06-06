import React from 'react'
import CardDisplay from './CardDisplay'
import styles from './CombatOverlay.module.css'

interface Combatant {
  id: string
  name: string
  hp: number
}

interface Props {
  players: Combatant[]
  enemies: Combatant[]
  hand: any[]
  log: string[]
  turn: number
  active?: string | null
  onPlayCard?: (id: string) => void
  onEndTurn?: () => void
}

export default function CombatOverlay({
  players,
  enemies,
  hand,
  log,
  turn,
  active,
  onPlayCard,
  onEndTurn,
}: Props) {
  return (
    <div className={styles.overlay}>
      <div className={styles.turnInfo}>Turn {turn}</div>
      <div className={styles.enemies}>
        {enemies.map(e => (
          <div
            key={e.id}
            className={
              active === e.id
                ? `${styles.combatant} ${styles.active}`
                : styles.combatant
            }
          >
            <strong>{e.name}</strong>
            <div className={styles.bar}>
              <span style={{ width: `${e.hp}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className={styles.party}>
        {players.map(p => (
          <div
            key={p.id}
            className={
              active === p.id
                ? `${styles.combatant} ${styles.active}`
                : styles.combatant
            }
          >
            <strong>{p.name}</strong>
            <div className={styles.bar}>
              <span style={{ width: `${p.hp}%` }} />
            </div>
          </div>
        ))}
        {onEndTurn && (
          <button className={styles.endTurn} onClick={onEndTurn}>
            End Turn
          </button>
        )}
      </div>
      <div className={styles.hand}>
        {hand.map(card => (
          <div key={card.id} className={styles.cardWrapper}>
            <CardDisplay
              card={card}
              onSelect={() => onPlayCard?.(card.id)}
              isSelected={false}
              isDisabled={false}
            />
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
