import React from 'react';
import { MOCK_HEROES } from '@shared/mock-data';
import CharacterCard from './CharacterCard';

interface PartyRosterProps {
  onBackToTown: () => void;
}

const PartyRoster: React.FC<PartyRosterProps> = ({ onBackToTown }) => {
  const heroes = Object.values(MOCK_HEROES);

  return (
    <div className="min-h-screen w-full flex flex-col items-center p-8 bg-gradient-to-br from-slate-900 via-gray-900 to-black text-gray-200">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold tracking-wide">Party Roster</h1>
        <p className="text-lg text-gray-400 mt-2">Review your available adventurers and their abilities.</p>
      </div>
      <div className="w-full max-w-5xl flex flex-wrap justify-center gap-6">
        {heroes.map((hero) => (
          <CharacterCard
            key={hero.id}
            name={hero.name}
            heroClass={hero.class}
            role={hero.archetype}
            portrait={hero.portrait}
            description={hero.description || ''}
            hp={hero.hp}
            maxHp={hero.maxHp}
          />
        ))}
      </div>
      <button
        onClick={onBackToTown}
        className="mt-12 px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-xl font-bold transition-colors shadow-lg"
      >
        Back to Town
      </button>
    </div>
  );
}; 

export default PartyRoster;
