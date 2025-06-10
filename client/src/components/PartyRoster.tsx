import React from 'react';
import { MOCK_HEROES } from '@shared/mock-data';
import HeroCard from './HeroCard';

interface PartyRosterProps {
  onBackToTown: () => void;
}

const PartyRoster: React.FC<PartyRosterProps> = ({ onBackToTown }) => {
  const heroes = Object.values(MOCK_HEROES);

  return (
    <div className="min-h-screen w-full flex flex-col items-center p-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold">Party Roster</h1>
        <p className="text-lg text-gray-400 mt-2">
          Review your available adventurers and their abilities.
        </p>
      </div>
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {heroes.map((hero) => (
          <HeroCard key={hero.id} hero={hero} />
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
