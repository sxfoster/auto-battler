import React from 'react';
import { UnitState } from '@shared/models/UnitState';

interface HeroCardProps {
  hero: UnitState;
}

const HeroCard: React.FC<HeroCardProps> = ({ hero }) => {
  const hpPercent = (hero.hp / hero.maxHp) * 100;

  return (
    <div className="bg-slate-800/80 rounded-xl p-5 flex flex-col items-center text-center shadow-lg hover:shadow-xl transition">
      <img
        src={hero.portrait || '/hero-placeholder.svg'}
        alt={`${hero.name} portrait`}
        className="w-24 h-24 object-cover rounded-full border-2 border-blue-500 shadow-md mb-4"
      />
      <h2 className="text-xl font-bold text-gray-200">{hero.name}</h2>
      <span className="mt-1 text-xs px-2 py-1 bg-blue-700 text-white rounded-full">
        {hero.archetype}
      </span>
      {hero.description && (
        <p className="mt-3 text-sm text-gray-300">{hero.description}</p>
      )}
      <div className="mt-auto w-full pt-4">
        <div className="w-full bg-gray-900 rounded-full h-3 border border-gray-600">
          <div
            className="bg-green-500 h-full rounded-full"
            style={{ width: `${hpPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-center text-sm font-semibold text-red-400 mt-1">
          <i className="fa-solid fa-heart mr-1" />
          {hero.hp} / {hero.maxHp} HP
        </div>
      </div>
    </div>
  );
};

export default HeroCard;
