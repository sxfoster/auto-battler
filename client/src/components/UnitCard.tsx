import React from 'react'
import styles from './UnitCard.module.css'

interface Action {
  label: string
  onClick: () => void
}

interface UnitCardProps {
  id: string
  name: string
  hp: number
  maxHp: number
  status?: string
  actions?: Action[]
  isActive?: boolean
  isDisabled?: boolean
  onSelect?: () => void
}

const UnitCard: React.FC<UnitCardProps> = ({
  name,
  hp,
  maxHp,
  status,
  actions = [],
  isActive = false,
  isDisabled = false,
  onSelect,
}) => {
  const percent = Math.max(0, Math.min(100, (hp / maxHp) * 100))

  const handleClick = () => {
    if (!isDisabled) {
      onSelect?.()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <div
      className={`${styles.card} ${isActive ? styles.active : ''} ${
        isDisabled ? styles.disabled : ''
      }`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={isDisabled ? -1 : 0}
      role="button"
      aria-pressed={isActive}
      aria-disabled={isDisabled}
      aria-label={`${name} HP ${hp}`}
    >
      <div className={styles.name}>{name}</div>
      <div className={styles.healthBar} aria-hidden="true">
        <span className={styles.health} style={{ width: `${percent}%` }} />
      </div>
      <div className={styles.hpText}>
        {hp} / {maxHp}
      </div>
      <div className={styles.status}>{status}</div>
      {actions.length > 0 && (
        <div className={styles.actions}>
          {actions.map((a, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation()
                if (!isDisabled) a.onClick()
              }}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default UnitCard
