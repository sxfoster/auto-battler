import React from 'react';
import { UnitState } from '@shared/models/UnitState';

const HeroCard: React.FC<{ hero: UnitState }> = ({ hero }) => {
  // Calculate health percentage for the HP bar
  const healthPercentage = (hero.hp / hero.maxHp) * 100;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-5 flex flex-col hover:border-blue-500 transition-colors duration-200 shadow-lg">
      {/* --- Name and Class --- */}
      <div>
        <h2 className="text-3xl font-bold text-white">{hero.name}</h2>
        <p className="text-md text-gray-400 -mt-1">{hero.class}</p>
      </div>

      {/* --- Archetype Tag --- */}
      <p className="mt-3 text-sm font-semibold text-gray-300">{hero.archetype}</p>

      {/* --- HP Bar and Text --- */}
      <div className="mt-auto pt-4">
        <div className="w-full bg-gray-900 rounded-full h-4 border border-gray-600">
          <div
            className="bg-green-500 h-full rounded-full"
            style={{ width: `${healthPercentage}%` }}
          ></div>
        </div>
        <p className="text-center text-xs font-semibold text-gray-300 mt-1">
          {hero.hp} / {hero.maxHp} HP
        </p>
      </div>
    </div>
  );
};

export default HeroCard;
