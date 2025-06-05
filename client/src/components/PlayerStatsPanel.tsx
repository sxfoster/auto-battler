import React from 'react'

interface Props {
  position: { x: number; y: number }
}

export default function PlayerStatsPanel({ position }: Props) {
  return (
    <div style={{ color: '#fff' }}>
      <h3>Player</h3>
      <p>
        Position: {position.x}, {position.y}
      </p>
    </div>
  )
}
