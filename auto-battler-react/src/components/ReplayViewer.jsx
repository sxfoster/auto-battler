import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useGameStore } from '../store.js'

export default function ReplayViewer() {
  const { id } = useParams()
  const setReplayLog = useGameStore(state => state.setReplayLog)
  const replayLog = useGameStore(state => state.replayLog)

  useEffect(() => {
    async function fetchReplay() {
      try {
        const res = await fetch(`/api/replays/${id}`)
        if (!res.ok) return
        const data = await res.json()
        setReplayLog(data)
      } catch (err) {
        console.error('Failed to fetch replay', err)
      }
    }
    fetchReplay()
  }, [id, setReplayLog])

  return (
    <div>
      <h2>Replay Viewer</h2>
      <pre>{JSON.stringify(replayLog, null, 2)}</pre>
    </div>
  )
}
