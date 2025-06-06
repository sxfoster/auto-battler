import React, { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import DungeonScene from '../phaser/DungeonScene'
import BattleScene from '../phaser/BattleScene'
import type { DungeonData } from '../utils/generateDungeon'

interface Props {
  dungeon: DungeonData
  playerPos: { x: number; y: number }
  explored: Set<string>
  party: any[]
  onMove: (pos: { x: number; y: number }, explored: Set<string>) => void
}

export default function DungeonMap({ dungeon, playerPos, explored, party, onMove }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: containerRef.current,
      scene: [DungeonScene, BattleScene],
    })
    game.scene.start('dungeon', { dungeon, playerPos, explored, party })
    const handler = (e: any) => {
      onMove(e.detail.position, new Set(e.detail.explored))
    }
    window.addEventListener('playerMove', handler)
    return () => {
      window.removeEventListener('playerMove', handler)
      game.destroy(true)
    }
  }, [dungeon, party])

  return <div ref={containerRef} />
}
