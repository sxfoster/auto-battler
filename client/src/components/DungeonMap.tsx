import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameState } from '../GameStateProvider.jsx'
import { generateDungeonMap } from '../utils/generateDungeonMap'
import { triggerRoomEvent } from 'shared/systems'
import GameView from './GameView'
import CombatOverlay from './CombatOverlay'
import { useNotification } from './NotificationManager.jsx'
import './DungeonMap.module.css'

const roomColors: Record<string, string> = {
  enemy: '#ff6666',
  boss: '#ff3333',
  treasure: '#ffd700',
  trap: '#ff00ff',
  rest: '#00aa7f',
  exit: '#00ffff',
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
  const updateGameState = useGameState(s => s.updateGameState)
  const save = useGameState(s => s.save)
  
  const navigate = useNavigate()
  const [battleRoom, setBattleRoom] = useState<string | null>(null)
  const [players, setPlayers] = useState([])
  const [enemies, setEnemies] = useState([])
  const [log, setLog] = useState<string[]>([])
  const [banner, setBanner] = useState(false)
  const [roomEvent, setRoomEvent] = useState<any | null>(null)
  const [summary, setSummary] = useState(false)
  const { notify } = useNotification()

  useEffect(() => {
    if (!dungeonMap) {
      const size = 5 + gameState.currentFloor - 1
      const map = generateDungeonMap(size)
      setDungeonMap(map)
      setCurrentRoom(map.startRoomId)
      setExplored(new Set([map.startRoomId]))
    }
  }, [dungeonMap, setDungeonMap, setCurrentRoom, setExplored, gameState.currentFloor])

  useEffect(() => {
    save()
  }, [currentRoom, explored, gameState.currentFloor])

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
    if (next.event) {
      const ev = triggerRoomEvent(next, gameState)
      setRoomEvent(ev)
      if (ev && ev.id === 'treasure') notify('Treasure found!', 'success')
      if (ev?.effectType === 'ambush') {
        setBanner(true)
        setTimeout(() => {
          setBanner(false)
          setBattleRoom(id)
        }, 600)
        return
      }
    }
    if (next.type === 'enemy' || next.type === 'boss') {
      setBanner(true)
      setTimeout(() => {
        setBanner(false)
        setBattleRoom(id)
      }, 600)
    } else if (next.type === 'exit') {
      setRoomEvent('exit')
      notify('Exit discovered', 'info')
    } else if (next.type !== 'empty') {
      setRoomEvent(next.type)
      if (next.type === 'treasure') notify('Treasure found!', 'success')
    }
  }

  const handleBattleEvent = (detail: any) => {
    if (detail.type === 'state') {
      setPlayers(detail.players)
      setEnemies(detail.enemies)
    } else if (detail.type === 'log') {
      setLog(l => [...l.slice(-10), detail.message])
    } else if (detail === 'Victory' || detail === 'Defeat') {
      notify(detail === 'Victory' ? 'Victory!' : 'Defeat...', detail === 'Victory' ? 'success' : 'error')
      const roomType = battleRoom ? dungeonMap?.rooms[battleRoom].type : null
      setTimeout(() => {
        setBattleRoom(null)
        if (roomType === 'boss') {
          setSummary(true)
        }
      }, 800)
    }
  }

  const advanceFloor = () => {
    const nextFloor = gameState.currentFloor + 1
    updateGameState({ currentFloor: nextFloor, location: 'dungeon' })
    const size = 5 + nextFloor - 1
    const map = generateDungeonMap(size)
    setDungeonMap(map)
    setCurrentRoom(map.startRoomId)
    setExplored(new Set([map.startRoomId]))
    setSummary(false)
    save()
  }

  const retreat = () => {
    updateGameState({ location: 'town' })
    setSummary(false)
    save()
    navigate('/town')
  }

  if (!party) return <p>No party selected.</p>
  if (!dungeonMap || !currentRoom) return <p>Entering Dungeon...</p>

  const totalRooms = Object.keys(dungeonMap.rooms).length
  const visitedRooms = explored.size
  const remaining = totalRooms - visitedRooms

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
        border: room.type === 'boss' || room.type === 'exit' ? '2px solid gold' : '1px solid #444',
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
      <p style={{ marginBottom: 10 }}>Room {visitedRooms} of {totalRooms} (Remaining {remaining})</p>
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
      {roomEvent && (
        <div className="battle-overlay">
          <div style={{ background: '#222', padding: 20, borderRadius: 8 }}>
            <p>
              {typeof roomEvent === 'string' && roomEvent === 'treasure' && 'You found treasure!'}
              {typeof roomEvent === 'string' && roomEvent === 'trap' && 'A trap sprung!'}
              {typeof roomEvent === 'string' && roomEvent === 'rest' && 'You take a moment to rest.'}
              {typeof roomEvent === 'string' && roomEvent === 'exit' && 'You found the exit!'}
              {typeof roomEvent !== 'string' && (
                <>
                  <strong>{roomEvent.name}</strong>
                  <br />
                  {roomEvent.description}
                </>
              )}
            </p>
            <div style={{ textAlign: 'center', marginTop: 10 }}>
              <button onClick={() => { setRoomEvent(null); if (roomEvent === 'exit' || roomEvent?.id === 'exit') setSummary(true) }}>Continue</button>
            </div>
          </div>
        </div>
      )}
      {summary && (
        <div className="battle-overlay">
          <div style={{ background: '#222', padding: 20, borderRadius: 8, textAlign: 'center' }}>
            <h3>Floor Complete!</h3>
            <p>Loot earned: (placeholder)</p>
            <p>Survival stats unchanged.</p>
            <div style={{ marginTop: 10 }}>
              <button onClick={advanceFloor} style={{ marginRight: 10 }}>Advance</button>
              <button onClick={retreat}>Retreat</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
