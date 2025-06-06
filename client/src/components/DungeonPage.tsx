import React, { useEffect } from 'react'
import PlayerStatsPanel from './PlayerStatsPanel'
import { generateDungeon } from '../utils/generateDungeon'
import { useGameStore } from '../store/gameStore'
import GameView from './GameView'

export default function DungeonPage() {
  const party = useGameStore(state => state.party)
  const dungeon = useGameStore(state => state.dungeon)
  const setDungeon = useGameStore(state => state.setDungeon)
  const playerPos = useGameStore(state => state.playerPos)
  const setPlayerPos = useGameStore(state => state.setPlayerPos)
  const explored = useGameStore(state => state.explored)
  const setExplored = useGameStore(state => state.setExplored)

  useEffect(() => {
    if (!dungeon) {
      const d = generateDungeon()
      setDungeon(d)
      setPlayerPos(d.start)
      setExplored(new Set([`${d.start.x},${d.start.y}`]))
    }
  }, [dungeon, setDungeon, setPlayerPos, setExplored])

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
