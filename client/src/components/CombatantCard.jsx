import React from 'react'
import defaultPortrait from '../../../shared/images/default-portrait.png'
import './CombatantCard.css'

export default function CombatantCard({ name, portraitUrl, currentHp, maxHp, currentEnergy, isActive }) {
  const ratio = Math.max(0, Math.min(1, currentHp / maxHp))
  return (
    <div
      role="group"
      aria-label={`${name}${isActive ? ' (active)' : ''}`}
      tabIndex={0}
      className={`combatant-card${isActive ? ' active' : ''}`}
    >
      <img src={portraitUrl || defaultPortrait} alt={name} className="portrait" />
      <div className="name">{name}</div>
      <div className="hp-bar"><div style={{ width: `${ratio * 100}%` }} /></div>
      <div className="energy">⚡{currentEnergy}</div>
    </div>
  )
}

