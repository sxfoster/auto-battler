import React from 'react';
import { UnitState } from '@shared/models/UnitState';

interface HeroCardProps {
  hero: UnitState;
}

// Helper to get a color based on archetype for styling the tag
const getArchetypeColor = (archetype: string) => {
  switch (archetype.toUpperCase()) {
    case 'DPS': return 'bg-red-500';
    case 'SUPPORT': return 'bg-blue-500';
    case 'HEALER': return 'bg-green-500';
    case 'TANK': return 'bg-yellow-500';
    default: return 'bg-gray-500';
  }
};

const HeroCard: React.FC<HeroCardProps> = ({ hero }) => {
  return (
    <div className="bg-gray-800 border-2 border-gray-700 rounded-lg p-4 flex flex-col hover:border-blue-500 transition-colors">
      {/* --- Card Header --- */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-2xl font-bold text-white">{hero.name}</h2>
        <span className={`px-3 py-1 text-xs font-bold rounded-full text-white ${getArchetypeColor(hero.archetype)}`}>
          {hero.archetype}
        </span>
      </div>
      
      {/* --- Core Stats --- */}
      <div className="flex gap-4 mb-4 text-sm text-gray-300">
        <div className="flex items-center gap-1">
          {/* SVG Icon for HP */}
          <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path></svg>
          <span className="font-semibold">{hero.maxHp} HP</span>
        </div>
        <div className="flex items-center gap-1">
          {/* SVG Icon for Speed */}
          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zM5 9a1 1 0 00-1 1v1a1 1 0 002 0v-1a1 1 0 00-1-1zm5-3a1 1 0 00-1 1v4a1 1 0 002 0V7a1 1 0 00-1-1zm4 5a1 1 0 100-2 1 1 0 000 2z"></path></svg>
          <span className="font-semibold">{hero.speed} Speed</span>
        </div>
      </div>
      
      {/* --- Base Cards List --- */}
      <div>
        <p className="font-bold text-sm text-gray-400 mb-2">Base Cards:</p>
        <ul className="space-y-1">
          {hero.cardPool.map(card => (
            <li key={card.id} className="text-xs bg-gray-700 p-2 rounded-md">
              <strong className="text-white">{card.name}</strong> - <span className="text-gray-300">{card.description}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default HeroCard;
