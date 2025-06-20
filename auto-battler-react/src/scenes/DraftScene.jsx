import React from 'react'
import { useGameStore } from '../store.js'
import Card from '../components/Card.jsx'

export default function DraftScene() {
  const { revealedCards, selectDraftCard, draftStage } = useGameStore(state => ({
    revealedCards: state.revealedCards,
    selectDraftCard: state.selectDraftCard,
    draftStage: state.draftStage,
  }))

  let instruction = 'Select a card.'
  if (draftStage.startsWith('HERO')) {
    instruction = draftStage === 'HERO_1_DRAFT' ? 'Choose your first hero.' : 'Choose your second hero.'
  } else if (draftStage.startsWith('WEAPON')) {
    instruction = 'Choose a weapon.'
  }

  return (
    <div className="scene">
      <h2 className="text-2xl font-cinzel mb-4 text-center">{instruction}</h2>
      <div className="draft-pool">
        {revealedCards.map(card => (
          <Card key={card.id} item={card} view="detail" onClick={() => selectDraftCard(card)} />
        ))}
      </div>
    </div>
  )
}
