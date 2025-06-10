import React from 'react';
import { UnitState } from '@shared/models/UnitState';
import HeroCard from './HeroCard';
import GameCard from './GameCard';

interface Props {
  party: UnitState[];
  onConfirm: () => void;
  onBack: () => void;
}

const PartySummary: React.FC<Props> = ({ party, onConfirm, onBack }) => {
  return (
    <div className="w-full max-w-4xl mx-auto text-center p-8">
      <h2 className="text-4xl font-bold mb-6">Party Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {party.map((u) => (
          <div key={u.id} className="flex flex-col items-center">
            <HeroCard hero={u} />
            <div className="mt-4 grid grid-cols-2 gap-2">
              {u.battleDeck.map((c) => (
                <GameCard key={c.id} card={c} />
              ))}
            </div>
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
          onClick={onConfirm}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
        >
          Save Party
        </button>
      </div>
    </div>
  );
};

export default PartySummary;
