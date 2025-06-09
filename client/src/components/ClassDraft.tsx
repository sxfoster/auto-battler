import React, { useState } from 'react';
import { UnitState } from '../../../shared/models/UnitState';
import { MOCK_HEROES } from '../../../game/src/logic/mock-data.js';

interface Props {
  onComplete: (party: UnitState[]) => void;
}

const availableHeroes: UnitState[] = Object.values(MOCK_HEROES).map(h => ({ ...h }));

const ClassDraft: React.FC<Props> = ({ onComplete }) => {
  const [selected, setSelected] = useState<UnitState[]>([]);

  const toggleHero = (hero: UnitState) => {
    setSelected(prev =>
      prev.find(h => h.id === hero.id)
        ? prev.filter(h => h.id !== hero.id)
        : [...prev, { ...hero }]
    );
  };

  return (
    <div>
      <h2>Class Draft</h2>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        {availableHeroes.map(hero => (
          <button key={hero.id} onClick={() => toggleHero(hero)}>
            {selected.find(h => h.id === hero.id) ? 'Remove' : 'Add'} {hero.name}
          </button>
        ))}
      </div>
      <button onClick={() => onComplete(selected)}>Confirm Party</button>
    </div>
  );
};

export default ClassDraft;
