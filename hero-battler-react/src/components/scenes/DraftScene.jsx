import React from 'react';
import DetailCard from '../ui/DetailCard.jsx';

export default function DraftScene({ options, onCardSelect }) {
  return (
    <div className="scene">
      <header className="text-center mb-8">
        <h1 className="text-5xl font-cinzel tracking-wider">Choose a Card</h1>
      </header>
      <div className="draft-pool">
        {options.map((card) => (
          <DetailCard key={card.id} card={card} onSelect={onCardSelect} />
        ))}
      </div>
    </div>
  );
}
