import React, { useState } from 'react';
import { UnitState } from '@shared/models/UnitState';

interface Props {
  availableHeroes: UnitState[];
  onComplete: (party: UnitState[]) => void;
  onBack: () => void;
}

const ClassDraft: React.FC<Props> = ({ availableHeroes, onComplete, onBack }) => {
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
      <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
        <button onClick={onBack}>Back</button>
        <button onClick={() => onComplete(selected)}>Confirm Party</button>
      </div>
    </div>
  );
};

export default ClassDraft;
