import React from 'react';
import { MOCK_HEROES } from '@shared/mock-data';

interface PartyRosterProps {
  onBackToTown: () => void;
}

const PartyRoster: React.FC<PartyRosterProps> = ({ onBackToTown }) => {
  const allHeroes = Object.values(MOCK_HEROES);

  return (
    <div className="min-h-screen flex flex-col items-center p-8 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8">Your Roster of Heroes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {allHeroes.map(hero => (
          <div key={hero.id} className="p-4 border-2 border-gray-700 rounded-lg bg-gray-800">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-bold">{hero.name}</h2>
              <span className={`px-2 py-1 text-xs font-bold rounded-full bg-red-500 text-white`}>{hero.archetype}</span>
            </div>
            <div className="text-sm opacity-80">
              <p>HP: {hero.maxHp}</p>
              <p>Speed: {hero.speed}</p>
            </div>
            <div className="mt-4">
              <p className="font-bold text-sm mb-1">Base Cards:</p>
              <ul className="list-disc list-inside text-xs">
                {hero.cardPool.map(card => <li key={card.id}>{card.name}</li>)}
              </ul>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={onBackToTown}
        className="mt-12 px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-xl font-bold transition-colors"
      >
        Back to Town
      </button>
    </div>
  );
};

export default PartyRoster;
