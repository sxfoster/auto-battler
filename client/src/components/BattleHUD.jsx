import React, { useEffect, useState } from 'react'
import { usePhaserScene } from '../hooks/usePhaserScene'

export default function BattleHUD() {
  const scene = usePhaserScene('battle')
  const [log, setLog] = useState([])

  useEffect(() => {
    if (!scene) return
    const handler = (entry) => {
      setLog((l) => [...l.slice(-19), entry])
    }
    scene.events.on('battle-log', handler)
    return () => {
      scene.events.off('battle-log', handler)
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
