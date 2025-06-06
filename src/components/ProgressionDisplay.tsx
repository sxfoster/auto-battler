import React from 'react'
import type { LootItem } from '../../shared/models/LootItem'

interface Props {
  level: number
  experience: number
  experienceToNext: number
  upcomingRewards?: LootItem[]
}

export default function ProgressionDisplay({
  level,
  experience,
  experienceToNext,
  upcomingRewards = [],
}: Props) {
  const percent = Math.max(0, Math.min(100, (experience / experienceToNext) * 100))
  return (
    <div style={{ maxWidth: 200 }}>
      <div style={{ fontWeight: 'bold' }}>Level {level}</div>
      <div style={{ background: '#555', height: 10, borderRadius: 4 }} aria-hidden="true">
        <span style={{ display: 'block', width: `${percent}%`, height: '100%', background: '#4caf50' }} />
      </div>
      <div style={{ fontSize: '0.75rem' }}>
        {experience} / {experienceToNext}
      </div>
      {upcomingRewards.length > 0 && (
        <ul style={{ fontSize: '0.75rem', marginTop: 4 }}>
          {upcomingRewards.map((r, i) => (
            <li key={i}>{r.id}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
