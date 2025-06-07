import React from 'react'
import styles from './UnitCard.module.css'
import defaultPortrait from '../../shared/images/default-portrait.png'

const STATUS_ICONS: Record<string, { icon: string; color: string }> = {
  poison: { icon: '☠', color: '#88ff88' },
  stun: { icon: '💫', color: '#ff66ff' },
  defense: { icon: '🛡', color: '#99ccff' },
  attack: { icon: '⚔', color: '#ffcc66' },
  marked: { icon: '🎯', color: '#ff8844' },
}

interface Action {
  label: string
  onClick: () => void
}

interface UnitCardProps {
  id: string
  name: string
  hp: number
  maxHp: number
  portrait?: string
  status?: string
  statuses?: { type: string; value?: number }[]
  actions?: Action[]
  isActive?: boolean
  isDisabled?: boolean
  onSelect?: () => void
}

const UnitCard: React.FC<UnitCardProps> = ({
  name,
  hp,
  maxHp,
  portrait,
  status,
  statuses = [],
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
      className={`${styles.battleCard} ${isActive ? styles.active : ''} ${
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
      <img
        src={portrait || defaultPortrait}
        alt={name}
        onError={e => {
          const img = e.currentTarget as HTMLImageElement
          if (img.src !== defaultPortrait) img.src = defaultPortrait
        }}
      />
      <div className={styles.name}>{name}</div>
      <div className={styles.hpBar} aria-hidden="true">
        <div
          className={styles.hpBarInner}
          style={{ width: `${percent}%` }}
        />
        <div className={styles.hpText}>
          {hp} / {maxHp}
        </div>
      </div>
      <div className={styles.status}>{status}</div>
      {statuses.length > 0 && (
        <div className={styles.statusRow} aria-hidden="true">
          {statuses.map((s, i) => {
            const meta = STATUS_ICONS[s.type] || { icon: s.type[0], color: '#fff' }
            return (
              <span
                key={i}
                className={styles.statusIcon}
                style={{ color: meta.color }}
                title={s.type}
              >
                {meta.icon}
              </span>
            )
          })}
        </div>
      )}
      {actions.length > 0 && (
        <div className={styles.actions}>
          {actions.map((a, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation()
                if (!isDisabled) a.onClick()
              }}
              className={styles.actionBtn}
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
