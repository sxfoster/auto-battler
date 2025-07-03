import React, { useEffect, useState, useRef } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import ReplayHeader from './ReplayHeader.jsx'
import CombatantPanel from './CombatantPanel.jsx'
import TimelineControls from './TimelineControls.jsx'

function parseSnapshots(data) {
  if (!data?.combatants || !Array.isArray(data.events)) return []
  const state = data.combatants.map(c => ({ ...c }))
  const snapshots = [state.map(c => ({ ...c }))]
  for (const ev of data.events) {
    if (ev.target && typeof ev.damage === 'number') {
      const t = state.find(c => c.id === ev.target)
      if (t) t.currentHp = Math.max(0, t.currentHp - ev.damage)
    }
    if (ev.target && typeof ev.heal === 'number') {
      const t = state.find(c => c.id === ev.target)
      if (t) t.currentHp = Math.min(t.maxHp, t.currentHp + ev.heal)
    }
    snapshots.push(state.map(c => ({ ...c })))
  }
  return snapshots
}

export default function ReplayViewer() {
  const params = useParams()
  const location = useLocation()
  const id = params.id || new URLSearchParams(location.search).get('id')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [snapshots, setSnapshots] = useState([])
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const url = id ? `/api/replays/${id}` : '/sample_replay.json'
        const res = await fetch(url)
        if (!res.ok) throw new Error('Failed to fetch replay')
        const json = await res.json()
        setData(json)
        setSnapshots(parseSnapshots(json))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  useEffect(() => {
    if (!playing) return
    timerRef.current = setTimeout(() => {
      setIndex(i => {
        if (i < snapshots.length - 1) return i + 1
        setPlaying(false)
        return i
      })
    }, 1000)
    return () => clearTimeout(timerRef.current)
  }, [playing, index, snapshots.length])

  if (loading) return <div className="p-4">Loading...</div>
  if (error) return <div className="p-4 text-red-500">{error}</div>
  const snapshot = snapshots[index] || []
  const prev = index > 0 ? snapshots[index - 1] : null
  const players = snapshot.filter(c => c.team === 'player')
  const enemies = snapshot.filter(c => c.team === 'enemy')

  return (
    <div className="p-4">
      <ReplayHeader meta={data} />
      <div className="flex flex-col md:flex-row justify-around gap-6">
        <div className="flex flex-col items-center gap-2">
          <h3 className="font-cinzel">Player</h3>
          {players.map(c => (
            <CombatantPanel
              key={c.id}
              combatant={c}
              prev={prev?.find(p => p.id === c.id)}
            />
          ))}
        </div>
        <div className="flex flex-col items-center gap-2">
          <h3 className="font-cinzel">Enemy</h3>
          {enemies.map(c => (
            <CombatantPanel
              key={c.id}
              combatant={c}
              prev={prev?.find(p => p.id === c.id)}
            />
          ))}
        </div>
      </div>
      <TimelineControls
        isPlaying={playing}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onPrev={() => setIndex(i => Math.max(0, i - 1))}
        onNext={() => setIndex(i => Math.min(snapshots.length - 1, i + 1))}
        current={index}
        total={snapshots.length - 1}
      />
    </div>
  )
}
