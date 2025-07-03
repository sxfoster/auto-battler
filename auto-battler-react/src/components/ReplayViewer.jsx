import React, { useEffect } from 'react'
import { useGameStore } from '../store.js'

export default function ReplayViewer() {
  const params = new URLSearchParams(window.location.search)
  const id = params.get('id')
  const setBattleLog = useGameStore(state => state.setBattleLog)
  const battleLog = useGameStore(state => state.battleLog)

  useEffect(() => {
    async function fetchReplay() {
      try {
        const res = await fetch(`/api/replay.php?id=${id}`)
        if (!res.ok) return
        const data = await res.json()
        setBattleLog(data)
      } catch (err) {
        console.error('Failed to fetch replay', err)
      }
    }
    fetchReplay()
  }, [id, setBattleLog])

  return (
    <div>
      <h2>Replay Viewer</h2>
      <pre>{JSON.stringify(battleLog, null, 2)}</pre>
    </div>
  )
}
