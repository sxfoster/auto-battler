import React, { useState } from 'react'
import { sampleCards } from '../../../shared/models/cards.js'
import type { UnitState } from './ClassDraft'

interface Props {
  party: UnitState[]
  onComplete: (party: UnitState[]) => void
}

export default function DeckBuilder({ party, onComplete }: Props) {
  const [decks, setDecks] = useState<Record<string, string[]>>(() => {
    const init: Record<string, string[]> = {}
    party.forEach(p => {
      init[p.id] = []
    })
    return init
  })

  const toggleCard = (unitId: string, cardId: string) => {
    setDecks(prev => {
      const list = prev[unitId]
      const has = list.includes(cardId)
      if (has) {
        return { ...prev, [unitId]: list.filter(c => c !== cardId) }
      }
      if (list.length >= 5) return prev
      return { ...prev, [unitId]: [...list, cardId] }
    })
  }

  const handleNext = () => {
    const updated = party.map(p => ({ ...p, deck: decks[p.id] || [] }))
    onComplete(updated)
  }

  return (
    <div>
      <h2>Build Starting Decks</h2>
      {party.map(unit => (
        <div key={unit.id} style={{ marginBottom: '1rem' }}>
          <h3>{unit.name}</h3>
          <ul>
            {sampleCards.map(card => (
              <li key={card.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={decks[unit.id]?.includes(card.id)}
                    onChange={() => toggleCard(unit.id, card.id)}
                  />
                  {card.name}
                </label>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <button onClick={handleNext}>Next</button>
    </div>
  )
}
