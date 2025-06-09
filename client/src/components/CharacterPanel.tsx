import React from 'react'
import type { UnitState } from 'shared/models/BattleStep'

interface Props {
  unit: UnitState
}

export default function CharacterPanel({ unit }: Props) {
  const isDead = unit.hp <= 0
  const buffList = Object.keys(unit.buffs || {})
  return (
    <div style={{ border: '1px solid #444', padding: '0.5rem', borderRadius: 8, width: 120, opacity: isDead ? 0.5 : 1 }}>
      <div style={{ fontWeight: 'bold' }}>{unit.name || unit.id}</div>
      <div>HP: {unit.hp}</div>
      {buffList.length > 0 && (
        <div style={{ fontSize: '0.75rem' }}>Buffs: {buffList.join(', ')}</div>
      )}
      {isDead && <div style={{ color: '#c33', fontWeight: 'bold' }}>DEAD</div>}
    </div>
  )
}
