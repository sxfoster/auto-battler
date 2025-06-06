import React, { useState } from 'react'
import PlayerStatsPanel from './PlayerStatsPanel'
import { generateDungeon } from '../utils/generateDungeon'
import { useGame } from '../GameContext'
import GameView from './GameView'

export default function DungeonPage() {
  const [dungeon] = useState(() => generateDungeon())
  const [playerPos, setPlayerPos] = useState(dungeon.start)
  const [explored, setExplored] = useState<Set<string>>(new Set([`${playerPos.x},${playerPos.y}`]))
  const { party } = useGame()

  const handleMove = (pos: { x: number; y: number }, exploredSet: Set<string>) => {
    setPlayerPos(pos)
    setExplored(exploredSet)
  }

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      <GameView
        scene="dungeon"
        dungeon={dungeon}
        playerPos={playerPos}
        explored={explored}
        party={party?.characters || []}
        onPlayerMove={handleMove}
      />
      <PlayerStatsPanel position={playerPos} />
    </div>
  )
}
