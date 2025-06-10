import React from 'react';
import { MOCK_HEROES } from '@shared/mock-data';
import HeroCard from './HeroCard';

interface PartyRosterProps {
  onBackToTown: () => void;
}

const PartyRoster: React.FC<PartyRosterProps> = ({ onBackToTown }) => {
  const allHeroes = Object.values(MOCK_HEROES);

  return (
    <div className="min-h-screen w-full flex flex-col items-center p-8 bg-gray-900 text-white">
      {/* --- Screen Header (Styled to match guide) --- */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold">Your Roster of Heroes</h1>
        <p className="text-lg text-gray-400 mt-2">Review your available adventurers and their abilities.</p>
      </div>

      {/* --- Responsive 2-Column Grid for Hero Cards --- */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {allHeroes.map(hero => (
          <HeroCard key={hero.id} hero={hero} />
        ))}
      </div>

      {/* --- Styled Action Button --- */}
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
