import React from 'react'
import defaultPortrait from '../../../shared/images/default-portrait.png'

export default function CombatantCard({ data, isActive }) {
  if (!data) return null
  const { name, portraitUrl, hp, maxHp, energy } = data
  const ratio = Math.max(0, Math.min(1, hp / maxHp))
  return (
    <div className={`combatant-card${isActive ? ' active' : ''}`}>
      <img src={portraitUrl || defaultPortrait} alt={name} />
      <div className="name">{name}</div>
      <div className="hp-bar">
        <div className="fill" style={{ width: `${ratio * 100}%` }} />
      </div>
      <div className="energy">⚡{energy}</div>
    </div>
  )
}
