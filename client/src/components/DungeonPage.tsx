import React, { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'
import DungeonScene from '../phaser/DungeonScene'
import MiniMap from './MiniMap'
import type { DungeonMap } from 'shared/models'

const STORAGE_KEY = 'dungeonState'

type StoredState = {
  dungeon: DungeonMap
  current: string
  explored: string[]
}

function generateDungeon(size = 5): DungeonMap {
  const rooms: Record<string, any> = {}
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      const id = `${x}-${y}`
      const typeOptions = ['empty', 'enemy', 'treasure', 'trap'] as const
      const type = typeOptions[Math.floor(Math.random() * typeOptions.length)]
      const connections: string[] = []
      if (x > 0) connections.push(`${x - 1}-${y}`)
      if (x < size - 1) connections.push(`${x + 1}-${y}`)
      if (y > 0) connections.push(`${x}-${y - 1}`)
      if (y < size - 1) connections.push(`${x}-${y + 1}`)
      rooms[id] = { id, x, y, type, connections }
    }
  }
  return { rooms, startRoomId: '0-0' }
}

export default function DungeonPage() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [dungeon, setDungeon] = useState<DungeonMap>(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const parsed: StoredState = JSON.parse(raw)
        return parsed.dungeon
      } catch {
        /* ignore */
      }
    }
    return generateDungeon()
  })
  const [current, setCurrent] = useState<string>(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const parsed: StoredState = JSON.parse(raw)
        return parsed.current
      } catch {
        /* ignore */
      }
    }
    return dungeon.startRoomId
  })
  const [explored, setExplored] = useState<Set<string>>(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const parsed: StoredState = JSON.parse(raw)
        return new Set(parsed.explored)
      } catch {
        /* ignore */
      }
    }
    return new Set([dungeon.startRoomId])
  })

  useEffect(() => {
    const stored: StoredState = {
      dungeon,
      current,
      explored: Array.from(explored),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  }, [dungeon, current, explored])

  useEffect(() => {
    if (!containerRef.current) return
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: 400,
      height: 400,
      parent: containerRef.current,
      scene: DungeonScene,
    })
    game.scene.start('dungeon', { dungeon, currentRoom: current })

    const handler = (e: any) => {
      setCurrent(e.detail)
      setExplored((prev) => new Set(prev).add(e.detail))
    }
    window.addEventListener('roomEnter', handler)
    return () => {
      window.removeEventListener('roomEnter', handler)
      game.destroy(true)
    }
  }, [dungeon])

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      <div ref={containerRef} />
      <MiniMap dungeon={dungeon} explored={explored} current={current} />
    </div>
  )
}
