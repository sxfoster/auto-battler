import React, { useState } from 'react';
import { UnitState } from '@shared/models/UnitState';
import { Card } from '@shared/models/Card';
import GameCard from './GameCard';

interface Props {
  unit: UnitState;
  onComplete: (unit: UnitState) => void;
  onBack: () => void;
}

const DeckBuilder: React.FC<Props> = ({ unit, onComplete, onBack }) => {
  const [selected, setSelected] = useState<Card[]>(unit.battleDeck || []);

  const toggleCard = (card: Card) => {
    setSelected(prev => {
      if (prev.find(c => c.id === card.id)) {
        return prev.filter(c => c.id !== card.id);
      }
      if (prev.length < 2) {
        return [...prev, card];
      }
      return prev;
    });
  };

  const handleConfirm = () => {
    onComplete({ ...unit, battleDeck: selected });
  };

  return (
    <div className="w-full max-w-4xl mx-auto text-center p-8">
      <h2 className="text-4xl font-bold mb-6">Build Deck for {unit.name}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {unit.cardPool.map(card => (
          <div
            key={card.id}
            onClick={() => toggleCard(card)}
            className="flex justify-center"
          >
            <GameCard card={card} selected={!!selected.find(c => c.id === card.id)} />
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-4">
        <button
          onClick={onBack}
          className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold"
        >
          Back
        </button>
        <button
          onClick={handleConfirm}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
        >
          Finish Deck
        </button>
      </div>
    </div>
  );
};

export default DeckBuilder;
