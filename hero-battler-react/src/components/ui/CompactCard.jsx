import React from 'react'
import './CompactCard.css'

export default function CompactCard({ combatant }) {
  return (
    <div className="compact-card">
      <div className="name">{combatant.name}</div>
      <div className="hp">HP: {combatant.hp}</div>
    </div>
  )
}
