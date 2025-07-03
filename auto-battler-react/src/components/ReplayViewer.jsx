import React, { useEffect, useState, useRef } from 'react'
import { useGameStore } from '../store.js'
import ReplayHeader from './replay/ReplayHeader.jsx'
import CombatantPanel from './replay/CombatantPanel.jsx'
import TimelineControls from './replay/TimelineControls.jsx'

export default function ReplayViewer() {
  const params = new URLSearchParams(window.location.search)
  const id = params.get('id')
  const setBattleLog = useGameStore(state => state.setBattleLog)
  const battleLog = useGameStore(state => state.battleLog)

  const [snapshots, setSnapshots] = useState([])
  const [current, setCurrent] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    async function fetchReplay() {
      try {
        const res = await fetch(`/api/replay.php?id=${id}`)
        if (!res.ok) throw new Error('Failed')
        const data = await res.json()
        setBattleLog(data)
      } catch (err) {
        console.error('Failed to fetch replay', err)
      }
    }
    if (id) fetchReplay()
  }, [id, setBattleLog])

  useEffect(() => {
    if (!battleLog) return
    let snaps = []
    if (Array.isArray(battleLog.snapshots)) {
      snaps = battleLog.snapshots
    } else if (Array.isArray(battleLog.events)) {
      let state = battleLog.events[0]?.combatants || []
      if (state.length) snaps.push(JSON.parse(JSON.stringify(state)))
      for (const ev of battleLog.events) {
        if (ev.combatants) state = ev.combatants
        snaps.push(JSON.parse(JSON.stringify(state)))
      }
    }
    setSnapshots(snaps)
    setCurrent(0)
  }, [battleLog])

  useEffect(() => {
    if (!isPlaying) return
    if (current >= snapshots.length - 1) {
      setIsPlaying(false)
      return
    }
    timerRef.current = setTimeout(() => setCurrent(c => Math.min(c + 1, snapshots.length - 1)), 1000)
    return () => clearTimeout(timerRef.current)
  }, [isPlaying, current, snapshots.length])

  const handlePlayPause = () => setIsPlaying(p => !p)
  const handleNext = () => setCurrent(c => Math.min(c + 1, snapshots.length - 1))
  const handlePrev = () => setCurrent(c => Math.max(c - 1, 0))

  if (!battleLog) {
    return <div className="scene"><div className="text-xl">Loading...</div></div>
  }

  if (!snapshots.length) {
    return <div className="scene">No replay data.</div>
  }

  const snapshot = snapshots[current]
  const prevSnapshot = current > 0 ? snapshots[current - 1] : null
  const playerSide = snapshot.filter(c => c.team === 'player')
  const enemySide = snapshot.filter(c => c.team !== 'player')

  const meta = {
    battleId: id,
    date: battleLog.created_at,
    playerName: battleLog.playerName || playerSide.map(c => c.name).join(', '),
    enemyName: battleLog.enemyName || enemySide.map(c => c.name).join(', '),
    result: battleLog.result,
  }

  return (
    <div className="replay-viewer container mx-auto p-4">
      <ReplayHeader meta={meta} />
      <div className="battlefield grid grid-cols-2 gap-4 mb-4">
        <div className="player-side flex flex-col items-center gap-4">
          {playerSide.map(c => (
            <CombatantPanel key={c.id} combatant={c} prev={prevSnapshot?.find(p => p.id === c.id)} />
          ))}
        </div>
        <div className="enemy-side flex flex-col items-center gap-4">
          {enemySide.map(c => (
            <CombatantPanel key={c.id} combatant={c} prev={prevSnapshot?.find(p => p.id === c.id)} />
          ))}
        </div>
      </div>
      <TimelineControls
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrev={handlePrev}
        currentTurn={current}
        totalTurns={snapshots.length - 1}
      />
    </div>
  )
}
