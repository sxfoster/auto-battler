import React from 'react'
import styles from './UnitCard.module.css'

export interface UnitInfo {
  id: string
  name: string
  hp: number
  maxHp: number
  status?: string[]
}

interface Props {
  unit: UnitInfo
  onAction?: (unit: UnitInfo) => void
  actionLabel?: string
  className?: string
}

export default function UnitCard({ unit, onAction, actionLabel = 'Info', className }: Props) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onAction?.(unit)
    }
  }

  const pct = Math.max(0, Math.min(100, (unit.hp / unit.maxHp) * 100))

  return (
    <div
      className={`${styles.card} ${className || ''}`}
      onClick={() => onAction?.(unit)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${unit.name} ${unit.hp} of ${unit.maxHp} HP${
        unit.status && unit.status.length ? ', ' + unit.status.join(', ') : ''
      }`}
    >
      <strong className={styles.name}>{unit.name}</strong>
      <div className={styles.bar} aria-hidden="true">
        <span style={{ width: `${pct}%` }} />
      </div>
      {unit.status && unit.status.length > 0 && (
        <div className={styles.statusList}>
          {unit.status.map((s) => (
            <span key={s} className={styles.status}>
              {s}
            </span>
          ))}
        </div>
      )}
      {onAction && (
        <button
          className={styles.actionButton}
          onClick={(e) => {
            e.stopPropagation()
            onAction(unit)
          }}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
