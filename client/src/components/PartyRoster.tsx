import React from 'react';
import { MOCK_HEROES } from '@shared/mock-data'; // Assuming MOCK_HEROES is our data source
import CharacterCard from './CharacterCard'; // Import our new component

interface PartyRosterProps {
  onBackToTown: () => void;
}

const PartyRoster: React.FC<PartyRosterProps> = ({ onBackToTown }) => {
  // Use a variable that matches the props for CharacterCard
  const party = Object.values(MOCK_HEROES).map(hero => ({
    id: hero.id,
    name: hero.name,
    className: hero.class,
    role: hero.archetype,
    hp: hero.hp,
    maxHp: hero.maxHp,
    // Add description and portraitUrl to your mock data
    description: `A brave ${hero.class} of the realm.`,
    portraitUrl: `/portraits/${hero.class.toLowerCase()}.png` // Example path
  }));

  return (
    <div className="min-h-screen w-full flex flex-col items-center p-8 bg-gray-900 text-white">
      {/* Polished Title Area */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold">Party Roster</h1>
        <p className="text-lg text-gray-400 mt-2">Review your available adventurers.</p>
      </div>

      {/* Responsive Grid for Character Cards */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {party.map(hero => (
          <CharacterCard
            key={hero.id}
            name={hero.name}
            className={hero.className}
            role={hero.role}
            hp={hero.hp}
            maxHp={hero.maxHp}
            description={hero.description}
            portraitUrl={hero.portraitUrl}
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
