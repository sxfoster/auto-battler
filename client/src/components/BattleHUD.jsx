import React, { useEffect, useState } from 'react'
import { usePhaserScene } from '../hooks/usePhaserScene'

export default function BattleHUD() {
  const scene = usePhaserScene('battle')
  const [log, setLog] = useState([])

  useEffect(() => {
    // ─── Add battle-log listener for rich, card-specific messages ───
    const logHandler = (entry) => {
      setLog((l) => {
        const next = [...l, entry]
        return next.length > 20 ? next.slice(next.length - 20) : next
      })
    }
    scene.events.on('battle-log', logHandler)

    return () => {
      scene.events.off('battle-log', logHandler)
    }
  }, [scene])

  return (
    <div className="battle-log">
      {log.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </div>
  )
}
