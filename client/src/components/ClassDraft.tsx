import React, { useState } from 'react';
import { UnitState } from '@shared/models/UnitState';
import { MOCK_HEROES } from '@shared/mock-data';
import HeroCard from './HeroCard';

interface Props {
  onComplete: (party: UnitState[]) => void;
  onBack: () => void;
}

const availableHeroes: UnitState[] = Object.values(MOCK_HEROES).map(h => ({ ...h }));

const ClassDraft: React.FC<Props> = ({ onComplete, onBack }) => {
  const [selected, setSelected] = useState<UnitState[]>([]);

  const toggleHero = (hero: UnitState) => {
    setSelected(prev =>
      prev.find(h => h.id === hero.id)
        ? prev.filter(h => h.id !== hero.id)
        : [...prev, { ...hero }]
    );
  };

  const isSelected = (hero: UnitState) => selected.find(h => h.id === hero.id);

  return (
    <div className="w-full max-w-4xl mx-auto text-center p-8">
      <h2 className="text-4xl font-bold mb-6">Class Draft</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {availableHeroes.map(hero => (
          <div
            key={hero.id}
            onClick={() => toggleHero(hero)}
            className={`cursor-pointer ${isSelected(hero) ? 'ring-2 ring-blue-500' : ''}`}
          >
            <HeroCard hero={hero} />
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
          onClick={() => onComplete(selected)}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
        >
          Confirm Party
        </button>
      </div>
    </div>
  );
};

export default ClassDraft;
