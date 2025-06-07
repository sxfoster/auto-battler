import React, { useEffect, useState } from 'react'
import { getDungeon } from 'shared/dungeonState'
import { Link } from 'react-router-dom'

export default function Event() {
  const [room, setRoom] = useState(null)

  useEffect(() => {
    const { current, rooms } = getDungeon()
    setRoom(rooms.find(r => r.x === current.x && r.y === current.y))
  }, [])

  if (!room) return null
  return (
    <div className="event-container">
      <h1>Event: {room.eventName || 'Mysterious Ruins'}</h1>
      <p>{room.description || 'You stumble upon…'}</p>
      <button onClick={() => {/* apply positive outcome */}}>Accept Offer</button>
      <button onClick={() => {/* apply negative outcome */}}>Walk Away</button>
      <Link to="/dungeon">Back to Dungeon</Link>
    </div>
  )
}
