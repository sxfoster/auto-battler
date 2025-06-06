import React, { useEffect, useMemo, useState } from 'react'
import { useGameState } from '../GameStateProvider.jsx'
import { generateDungeonMap } from '../utils/generateDungeonMap'
import GameView from './GameView'
import CombatOverlay from './CombatOverlay'
import './DungeonMap.module.css'

const roomColors: Record<string, string> = {
  enemy: '#ff6666',
  treasure: '#ffd700',
  trap: '#ff00ff',
  empty: '#666666',
}

export default function DungeonMap() {
  const party = useGameState(s => s.party)
  const dungeonMap = useGameState(s => s.dungeonMap)
  const setDungeonMap = useGameState(s => s.setDungeonMap)
  const currentRoom = useGameState(s => s.currentRoom)
  const setCurrentRoom = useGameState(s => s.setCurrentRoom)
  const explored = useGameState(s => s.explored)
  const setExplored = useGameState(s => s.setExplored)
  const gameState = useGameState(s => s.gameState)

  const [battleRoom, setBattleRoom] = useState<string | null>(null)
  const [players, setPlayers] = useState([])
  const [enemies, setEnemies] = useState([])
  const [log, setLog] = useState<string[]>([])
  const [banner, setBanner] = useState(false)

  useEffect(() => {
    if (!dungeonMap) {
      const map = generateDungeonMap(5)
      setDungeonMap(map)
      setCurrentRoom(map.startRoomId)
      setExplored(new Set([map.startRoomId]))
    }
  }, [dungeonMap, setDungeonMap, setCurrentRoom, setExplored])

  const size = useMemo(() => {
    if (!dungeonMap) return 0
    return Math.max(...Object.values(dungeonMap.rooms).map(r => r.x)) + 1
  }, [dungeonMap])

  const moveTo = (id: string) => {
    if (!dungeonMap || !currentRoom) return
    const room = dungeonMap.rooms[currentRoom]
    if (!room.connections.includes(id)) return
    setCurrentRoom(id)
    setExplored(new Set([...Array.from(explored), id]))
    const next = dungeonMap.rooms[id]
    if (next.type === 'enemy') {
      setBanner(true)
      setTimeout(() => {
        setBanner(false)
        setBattleRoom(id)
      }, 600)
    }
  }

  const handleBattleEvent = (detail: any) => {
    if (detail.type === 'state') {
      setPlayers(detail.players)
      setEnemies(detail.enemies)
    } else if (detail.type === 'log') {
      setLog(l => [...l.slice(-10), detail.message])
    } else if (detail === 'Victory' || detail === 'Defeat') {
      setTimeout(() => setBattleRoom(null), 800)
    }
  }

  if (!party) return <p>No party selected.</p>
  if (!dungeonMap || !currentRoom) return <p>Entering Dungeon...</p>

  const cells = []
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const id = `${x}-${y}`
      const room = dungeonMap.rooms[id]
      if (!room) continue
      const isExplored = explored.has(id)
      const isCurrent = id === currentRoom
      const isReachable = dungeonMap.rooms[currentRoom].connections.includes(id)
      const style: React.CSSProperties = {
        width: 40,
        height: 40,
        background: isExplored ? roomColors[room.type] : '#000',
        opacity: isExplored ? 1 : 0.2,
        border: '1px solid #444',
        position: 'relative',
        cursor: isReachable && isExplored ? 'pointer' : 'default',
      }
      cells.push(
        <div
          key={id}
          style={style}
          onClick={() => isReachable && isExplored && moveTo(id)}
        >
          {isCurrent && <div className="player-marker" />}
        </div>,
      )
    }
  }

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${size}, 40px)`,
    gap: '2px',
    position: 'relative',
  }

  return (
    <div style={{ padding: 20, position: 'relative' }}>
      <h2>Dungeon - Floor {gameState.currentFloor}</h2>
      <div style={gridStyle}>{cells}</div>
      {banner && <div className="encounter-banner">Enemy Encountered!</div>}
      {battleRoom && !banner && (
        <div className="battle-overlay">
          <GameView
            scene="battle"
            party={party.characters}
            enemyIndex={0}
            onBattleEvent={handleBattleEvent}
          />
          <CombatOverlay players={players} enemies={enemies} log={log} />
        </div>
      )}
    </div>
  )
}
