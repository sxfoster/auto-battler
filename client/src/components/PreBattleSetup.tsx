import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import type { PartyCharacter } from './PartySetup'
import type { Card } from '../../../shared/models/Card'
import { sampleCards } from '../../../shared/models/cards.js'
import CardAssignmentPanel from './CardAssignmentPanel'
import { saveFormation, loadFormation } from '../../game/SetupManager'
import type { Formation, Position } from '../../game/Formation'
import styles from './PreBattleSetup.module.css'

const GRID_SIZE = 3

const emptyFormation = (): Formation => ({ gridSize: GRID_SIZE, units: [] })

const PreBattleSetup: React.FC = () => {
  const navigate = useNavigate()
  const party = useGameStore(state => state.party)
  const [characters, setCharacters] = useState<PartyCharacter[]>([])
  const [placement, setPlacement] = useState<Record<string, Position>>({})
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const [availableCards, setAvailableCards] = useState<Card[]>([])

  useEffect(() => {
    if (party) {
      const chars: PartyCharacter[] = party.characters.map(c => ({
        ...c,
        assignedCards: c.deck || [],
      }))
      setCharacters(chars)
    }
  }, [party])

  useEffect(() => {
    setAvailableCards(sampleCards.map(c => ({ ...c, description: c.description || 'No description.' })))
  }, [])

  useEffect(() => {
    const saved = loadFormation()
    if (saved && saved.gridSize === GRID_SIZE) {
      const map: Record<string, Position> = {}
      saved.units.forEach(u => { map[u.unitId] = u.position })
      setPlacement(map)
    }
  }, [])

  const handleDragStart = (id: string) => {
    setDragId(id)
  }

  const handleDrop = (x: number, y: number) => {
    if (dragId) {
      setPlacement(prev => ({ ...prev, [dragId]: { x, y } }))
      setDragId(null)
    }
  }

  const handleAssignCard = (characterId: string, card: Card) => {
    setCharacters(chars =>
      chars.map(c => (c.id === characterId ? { ...c, assignedCards: [...c.assignedCards, card] } : c)),
    )
  }

  const handleRemoveCard = (characterId: string, cardId: string) => {
    setCharacters(chars =>
      chars.map(c =>
        c.id === characterId
          ? { ...c, assignedCards: c.assignedCards.filter(cd => cd.id !== cardId) }
          : c,
      ),
    )
  }

  const saveSetup = () => {
    const formation: Formation = {
      gridSize: GRID_SIZE,
      units: characters.map(c => ({
        unitId: c.id,
        position: placement[c.id] || { x: 0, y: 0 },
        cardIds: c.assignedCards.map(card => card.id),
      })),
    }
    saveFormation(formation)
  }

  const selectedChar = characters.find(c => c.id === selectedId) || null

  return (
    <div className={styles.screen}>
      <div className={styles.setupCard}>
        <h1 className={styles.title}>Pre-Battle Setup</h1>
        <div className={styles.grid}>
          {Array.from({ length: GRID_SIZE }).map((_, y) =>
            Array.from({ length: GRID_SIZE }).map((__, x) => {
              const occupant = characters.find(c => placement[c.id]?.x === x && placement[c.id]?.y === y)
              return (
                <div
                  key={`${x}-${y}`}
                  className={styles.cell}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => handleDrop(x, y)}
                >
                  {occupant ? (
                    <div
                      draggable
                      onDragStart={() => handleDragStart(occupant.id)}
                      onClick={() => setSelectedId(occupant.id)}
                      className={`${styles.unit} ${selectedId === occupant.id ? styles.unitSelected : ''}`}
                    >
                      {occupant.name}
                    </div>
                  ) : (
                    'Empty'
                  )}
                </div>
              )
            }),
          )}
        </div>
        <div className={styles.unitList}>
          {characters.map(c => (
            <div
              key={c.id}
              draggable
              onDragStart={() => handleDragStart(c.id)}
              onClick={() => setSelectedId(c.id)}
              className={`${styles.unit} ${selectedId === c.id ? styles.unitSelected : ''}`}
            >
              {c.name}
            </div>
          ))}
        </div>
        {selectedChar && (
          <CardAssignmentPanel
            character={selectedChar}
            availableCards={availableCards}
            onAssignCard={handleAssignCard}
            onRemoveCard={handleRemoveCard}
          />
        )}
        <div className={styles.buttons}>
          <button onClick={saveSetup}>Save</button>
          <button
            onClick={() => {
              saveSetup()
              navigate('/battle')
            }}
          >
            Start Battle
          </button>
        </div>
      </div>
    </div>
  )
}

export default PreBattleSetup
