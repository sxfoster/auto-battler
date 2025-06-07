import React, { useEffect, useState } from 'react'
import { generateDungeon, getDungeon, moveTo } from 'shared/dungeonState'
import './Dungeon.css'

export default function Dungeon() {
  const [d, setD] = useState(null)

  useEffect(() => {
    generateDungeon(5, 5)
    setD({ ...getDungeon() })
  }, [])

  const handleClick = (x, y) => {
    moveTo(x, y)
    const dungeon = getDungeon()
    const neighbors = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ]
    neighbors.forEach(([nx, ny]) => {
      const room = dungeon.rooms.find((r) => r.x === nx && r.y === ny)
      if (room) room.visited = true
    })
    setD({ ...dungeon })
  }

  if (!d) return null
  return (
    <div className="dungeon-container">
      <h1>Dungeon – Floor 1</h1>
      <div className="dungeon-grid">
        {d.rooms.map((r, i) => (
          <div
            key={i}
            className={`dungeon-tile ${r.visited ? 'visited' : ''} ${
              r.x === d.current.x && r.y === d.current.y ? 'current' : ''
            }`}
            onClick={() => handleClick(r.x, r.y)}
          />
        ))}
      </div>
      <p>
        Room{' '}
        {d.rooms.findIndex((r) => r.x === d.current.x && r.y === d.current.y) + 1}{' '}
        of {d.rooms.length}
      </p>
    </div>
  )
}
