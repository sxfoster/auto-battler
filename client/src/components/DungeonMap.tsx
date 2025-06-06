import React, { useEffect } from 'react'
import { useGameState } from '../GameStateProvider.jsx'
import { generateDungeon } from '../utils/generateDungeon'

export default function DungeonMap() {
  const party = useGameState(state => state.party)
  const gameState = useGameState(state => state.gameState)
  const dungeon = useGameState(state => state.dungeon)
  const setDungeon = useGameState(state => state.setDungeon)

  useEffect(() => {
    if (!dungeon) {
      const d = generateDungeon(9, 9)
      setDungeon(d)
    }
  }, [dungeon, setDungeon])

  if (!party) {
    return <p>No party selected.</p>
  }

  const renderGrid = () => {
    if (!dungeon) return <p>Entering Dungeon...</p>
    const rows = []
    for (let y = 0; y < dungeon.height; y++) {
      const cells = []
      for (let x = 0; x < dungeon.width; x++) {
        const tile = dungeon.tiles[y][x]
        const style: React.CSSProperties = {
          width: 20,
          height: 20,
          backgroundColor: tile === 'wall' ? '#333' : '#888',
          border: '1px solid #222',
        }
        cells.push(<div key={x} style={style} />)
      }
      rows.push(
        <div key={y} style={{ display: 'flex' }}>
          {cells}
        </div>,
      )
    }
    return <div>{rows}</div>
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Dungeon - Floor {gameState.currentFloor}</h2>
      <div style={{ display: 'flex', gap: '2rem' }}>
        <div>{renderGrid()}</div>
        <div>
          <h3>Party</h3>
          <ul>
            {party.characters.map((c) => (
              <li key={c.id}>
                {c.name}
                <ul>
                  {c.deck.map((card) => (
                    <li key={card.id}>{card.name}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <h3>Inventory</h3>
          <p>{gameState.inventory.length} items</p>
        </div>
      </div>
    </div>
  )
}
