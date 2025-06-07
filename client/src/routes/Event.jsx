import React, { useEffect, useState } from 'react'
import { getDungeon } from 'shared/dungeonState'
import { applyEventOutcome } from 'shared/dungeonEvents'
import { Link, useNavigate } from 'react-router-dom'

export default function Event() {
  const [room, setRoom] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const { current, rooms } = getDungeon()
    setRoom(rooms.find(r => r.x === current.x && r.y === current.y))
  }, [])

  const handleOutcome = (outcome) => {
    // apply reward/penalty to party (e.g. inventory, HP, gold…)
    applyEventOutcome(outcome)
    navigate('/dungeon')
  }

  if (!room) return null
  return (
    <div className="event-container">
      <h1>Event: {room.eventName || 'Mysterious Ruins'}</h1>
      <p>{room.description || 'You stumble upon…'}</p>
      <button onClick={() => handleOutcome('accept')}>Accept Offer</button>
      <button onClick={() => handleOutcome('decline')}>Walk Away</button>
      <Link to="/dungeon">Back to Dungeon</Link>
    </div>
  )
}
