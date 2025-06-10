import React from 'react';
import { Card } from '@shared/models/Card';

interface GameCardProps {
  card: Card;
  onSelect?: (card: Card) => void;
  disabled?: boolean;
  selected?: boolean;
}

const GameCard: React.FC<GameCardProps> = ({ card, onSelect, disabled, selected }) => {
  const handleClick = () => {
    if (!disabled) {
      onSelect?.(card);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative w-40 h-56 bg-gray-200 rounded-xl flex flex-col overflow-hidden shadow-lg text-gray-900 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-2xl transition-shadow'} ${selected ? 'ring-2 ring-blue-500' : ''}`}
    >
      <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-gray-800 text-white text-sm font-bold flex items-center justify-center">
        {card.cost}
      </div>
      <div className="bg-gray-800 text-white text-center py-1">
        <span className="text-sm font-semibold">{card.name}</span>
      </div>
      <div className="flex-grow bg-white p-2 text-xs leading-snug">
        {card.description}
      </div>
    </div>
  );
};

export default GameCard;
