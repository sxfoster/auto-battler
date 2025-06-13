import React from 'react'
import DetailCard from '../ui/DetailCard'

export default function DraftScene({ options, onCardSelect }) {
  return (
    <div className="draft-scene">
      {options.map((card) => (
        <DetailCard key={card.id} card={card} onSelect={onCardSelect} />
      ))}
    </div>
  )
}
