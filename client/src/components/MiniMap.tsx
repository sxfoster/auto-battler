import React from 'react'
import type { DungeonMap } from 'shared/models'

interface MiniMapProps {
  dungeon: DungeonMap
  explored: Set<string>
  current: string
}

const colors: Record<string, string> = {
  enemy: '#ff0000',
  treasure: '#ffff00',
  trap: '#ff00ff',
  empty: '#666666',
}

export default function MiniMap({ dungeon, explored, current }: MiniMapProps) {
  const size = Math.max(...Object.values(dungeon.rooms).map((r) => r.x)) + 1
  const rows = []
  for (let y = 0; y < size; y++) {
    const cells = []
    for (let x = 0; x < size; x++) {
      const id = `${x}-${y}`
      const room = dungeon.rooms[id]
      const isExplored = explored.has(id)
      const style: React.CSSProperties = {
        width: 20,
        height: 20,
        border: '1px solid #444',
        background: isExplored ? colors[room.type] : '#000',
        opacity: isExplored ? 1 : 1,
      }
      if (id === current) {
        style.outline = '2px solid white'
      }
      cells.push(<div key={id} style={style} />)
    }
    rows.push(
      <div key={y} style={{ display: 'flex' }}>
        {cells}
      </div>,
    )
  }
  return <div>{rows}</div>
}
