import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateDungeon, getDungeon, moveTo } from 'shared/dungeonState'
import './Dungeon.css'

export default function Dungeon() {
  const [d, setD] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    generateDungeon(5, 5)
    setD({ ...getDungeon() })
  }, [])

  const handleClick = (x, y) => {
    // move the player and mark the selected room as visited
    moveTo(x, y)

    // also mark the four neighboring rooms as visited
    const dungeon = getDungeon()
    const markVisited = (mx, my) => {
      const neighbor = dungeon.rooms.find((r) => r.x === mx && r.y === my)
      if (neighbor) neighbor.visited = true
    }
    markVisited(x + 1, y)
    markVisited(x - 1, y)
    markVisited(x, y + 1)
    markVisited(x, y - 1)

    setD({ ...dungeon })

    const room = dungeon.rooms.find((r) => r.x === x && r.y === y)
    switch (room?.type) {
      case 'combat':
        return navigate('/battle')
      case 'shop':
        return navigate('/shop')
      case 'event':
        return navigate('/event')
      default:
        return
    }
  }

  if (!d) return null
  return (
    <div className="dungeon-container">
      <h1>Dungeon – Floor 1</h1>
      <div className="dungeon-grid">
        {d.rooms.map((r, i) => {
          // determine if tile is revealed
          const dx = Math.abs(r.x - d.current.x)
          const dy = Math.abs(r.y - d.current.y)
          const revealed = r.visited || dx + dy === 1
          let icon = ''
          switch (r.type) {
            case 'shop':
              icon = '🛒'
              break
            case 'event':
              icon = '❓'
              break
            case 'combat':
              icon = '⚔️'
              break
            case 'start':
              icon = '🏠'
              break
            case 'end':
              icon = '🚪'
              break
          }
          return (
            <div
              key={i}
              className={`dungeon-tile ${revealed ? 'revealed' : ''} ${
                r.visited ? 'visited' : ''
              } ${r.type}`}
              onClick={() => revealed && handleClick(r.x, r.y)}
            >
              <span className="dungeon-icon">{icon}</span>
            </div>
          )
        })}
      </div>
      <p>
        Room{' '}
        {d.rooms.findIndex((r) => r.x === d.current.x && r.y === d.current.y) + 1}{' '}
        of {d.rooms.length}
      </p>
    </div>
  )
}
