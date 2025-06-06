import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import { sampleCards } from 'shared/models/cards.js'

function DeckManager() {
  const decks = useGameStore(state => state.decks)
  const addDeck = useGameStore(state => state.addDeck)
  const removeDeck = useGameStore(state => state.removeDeck)
  const selectDeck = useGameStore(state => state.selectDeck)
  const activeDeckId = useGameStore(state => state.activeDeckId)
  const [name, setName] = useState('')
  const navigate = useNavigate()

  const createDeck = () => {
    if (!name.trim()) return
    addDeck({ id: Date.now().toString(), name: name.trim(), cards: sampleCards.slice(0, 4).map(c => c.id) })
    setName('')
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Deck Manager</h1>
      <ul>
        {decks.map((d) => (
          <li key={d.id} style={{ marginBottom: '0.5rem' }}>
            <button onClick={() => selectDeck(d.id)} style={{ marginRight: '0.5rem' }}>
              {d.name} {activeDeckId === d.id ? '(Active)' : ''}
            </button>
            <button onClick={() => removeDeck(d.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: '1rem' }}>
        <input
          placeholder="New deck name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={createDeck} style={{ marginLeft: '0.5rem' }}>Add Deck</button>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <button onClick={() => navigate('/')}>Back</button>
      </div>
    </div>
  )
}

export default DeckManager
