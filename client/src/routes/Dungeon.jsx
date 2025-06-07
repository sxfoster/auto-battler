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
    setD({ ...getDungeon() })
  }

  if (!d) return null
  return (
    <div className="dungeon-container">
      <h1>Dungeon – Floor 1</h1>
      <div className="dungeon-grid">
        {d.rooms.map((r, i) => (
          <div
            key={i}
            className={`dungeon-tile ${r.revealed ? 'revealed' : ''} ${
              r.visited ? 'visited' : ''
            } ${
              r.x === d.current.x && r.y === d.current.y ? 'current' : ''
            }`}
            onClick={() => r.revealed && handleClick(r.x, r.y)}
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
