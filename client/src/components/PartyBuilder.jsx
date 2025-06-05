import { useState } from 'react'
import { sampleCharacters } from 'shared/models/characters.js'
import { sampleCards } from 'shared/models/cards.js'

function PartyBuilder() {
  const [party, setParty] = useState([])
  const [selectedCards, setSelectedCards] = useState({})

  const availableCharacters = sampleCharacters.filter(
    (c) => !party.some((p) => p.id === c.id),
  )

  function addCharacter(char) {
    if (party.length >= 5) return
    setParty([...party, { ...char, cards: [] }])
  }

  function removeCharacter(id) {
    setParty(party.filter((c) => c.id !== id))
  }

  function addCard(index) {
    const cardId = selectedCards[index]
    if (!cardId) return
    setParty((prev) =>
      prev.map((c, i) => {
        if (i !== index || c.cards.length >= 4 || c.cards.includes(cardId))
          return c
        return { ...c, cards: [...c.cards, cardId] }
      }),
    )
  }

  function removeCard(index, cardId) {
    setParty((prev) =>
      prev.map((c, i) => {
        if (i !== index) return c
        return { ...c, cards: c.cards.filter((id) => id !== cardId) }
      }),
    )
  }

  function startGame() {
    const fullParty = party.map((char) => ({
      id: char.id,
      name: char.name,
      class: '',
      stats: { hp: 100, energy: 3 },
      deck: char.cards.map((cid) => {
        const card = sampleCards.find((c) => c.id === cid)
        return {
          id: cid,
          name: card ? card.name : cid,
          type: 'basic',
          cost: 0,
          effects: [],
        }
      }),
      survival: { hunger: 0, thirst: 0, fatigue: 0 },
    }))

    localStorage.setItem('partyData', JSON.stringify(fullParty))
    // Navigate to the Phaser game. In a production app this could be a route
    // change or modal. For simplicity we load the bundled game directly.
    window.location.href = '/game'
  }

  return (
    <div className="party-builder">
      <div className="selection">
        <h2>Add Characters</h2>
        <ul>
          {availableCharacters.map((c) => (
            <li key={c.id}>
              {c.name}{' '}
              <button
                disabled={party.length >= 5}
                onClick={() => addCharacter(c)}
              >
                Add
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="preview">
        <h2>Party Preview</h2>
        {party.length === 0 && <p>No characters added.</p>}
        <ul>
          {party.map((char, idx) => (
            <li key={char.id}>
              <strong>{char.name}</strong>{' '}
              <button onClick={() => removeCharacter(char.id)}>Remove</button>
              <ul>
                {char.cards.map((cid) => {
                  const card = sampleCards.find((c) => c.id === cid)
                  return (
                    <li key={cid}>
                      {card ? card.name : cid}{' '}
                      <button onClick={() => removeCard(idx, cid)}>X</button>
                    </li>
                  )
                })}
              </ul>
              {char.cards.length < 4 && (
                <div>
                  <select
                    value={selectedCards[idx] || ''}
                    onChange={(e) =>
                      setSelectedCards({
                        ...selectedCards,
                        [idx]: e.target.value,
                      })
                    }
                  >
                    <option value="">Select card</option>
                    {sampleCards.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <button onClick={() => addCard(idx)}>Add Card</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="start-game">
        <button disabled={party.length === 0} onClick={startGame}>
          Start Game
        </button>
      </div>
    </div>
  )
}

export default PartyBuilder
