import React, { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import DungeonScene from '../phaser/DungeonScene'
import BattleScene from 'game/src/scenes/BattleScene'
import type { DungeonData } from '../utils/generateDungeon'

export type SceneKey = 'dungeon' | 'battle'

interface Props {
  scene: SceneKey
  dungeon?: DungeonData
  playerPos?: { x: number; y: number }
  explored?: Set<string>
  party?: any[]
  enemyIndex?: number
  onPlayerMove?: (pos: { x: number; y: number }, explored: Set<string>) => void
  onBattleEvent?: (detail: any) => void
}

export default function GameView({
  scene,
  dungeon,
  playerPos,
  explored,
  party,
  enemyIndex,
  onPlayerMove,
  onBattleEvent,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const gameRef = useRef<Phaser.Game | null>(null)
  const currentScene = useRef<string>('')

  // mount Phaser game once
  useEffect(() => {
    if (!containerRef.current) return
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: containerRef.current,
      scene: [DungeonScene, BattleScene],
    })
    gameRef.current = game
    // expose game instance for hooks like usePhaserScene
    ;(window as any).__phaserGame = game

    const moveHandler = (e: any) => {
      onPlayerMove?.(e.detail.position, new Set(e.detail.explored))
    }
    const battleHandler = (e: any) => {
      onBattleEvent?.(e.detail)
    }
    window.addEventListener('playerMove', moveHandler)
    window.addEventListener('battleState', battleHandler)
    return () => {
      window.removeEventListener('playerMove', moveHandler)
      window.removeEventListener('battleState', battleHandler)
      game.destroy(true)
    }
  }, [])

  // switch scenes when props change
  useEffect(() => {
    const game = gameRef.current
    if (!game) return
    if (currentScene.current && game.scene.isActive(currentScene.current)) {
      game.scene.stop(currentScene.current)
    }
    if (scene === 'dungeon' && dungeon) {
      game.scene.start('dungeon', {
        dungeon,
        playerPos,
        explored,
        party,
      })
    } else if (scene === 'battle') {
      game.scene.start('battle', { enemyIndex, party })
    }
    currentScene.current = scene
  }, [scene, dungeon, party, enemyIndex])

  return <div ref={containerRef} />
}
