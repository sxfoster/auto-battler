import React, { useState } from 'react';
import { UnitState } from '../../shared/models/UnitState';
import { Card } from '../../shared/models/Card';

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
    <div>
      <h2>Build Deck for {unit.name}</h2>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {unit.cardPool.map(card => (
          <button key={card.id} onClick={() => toggleCard(card)}>
            {selected.find(c => c.id === card.id) ? 'Remove' : 'Add'} {card.name}
          </button>
        ))}
      </div>
      <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
        <button onClick={onBack}>Back</button>
        <button onClick={handleConfirm}>Finish Deck</button>
      </div>
    </div>
  );
};

export default DeckBuilder;
