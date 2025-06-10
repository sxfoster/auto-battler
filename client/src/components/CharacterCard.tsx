import React from 'react';

// Define the props this component expects
interface CharacterCardProps {
  name: string;
  className: string; // "class" is a reserved word in JS, so we use "className"
  role: 'DPS' | 'Support' | 'Tank' | 'Healer';
  hp: number;
  maxHp: number;
  description: string;
  portraitUrl: string; // URL to the character's portrait
}

// Helper to get a color based on the role
const getRoleColor = (role: CharacterCardProps['role']) => {
  switch (role) {
    case 'DPS': return 'bg-red-500 text-white';
    case 'Support': return 'bg-purple-500 text-white';
    case 'Healer': return 'bg-green-500 text-white';
    case 'Tank': return 'bg-yellow-500 text-black';
    default: return 'bg-gray-500 text-white';
  }
};

const CharacterCard: React.FC<CharacterCardProps> = ({ name, className, role, hp, maxHp, description, portraitUrl }) => {
  const healthPercentage = (hp / maxHp) * 100;

  return (
    <div className="w-72 h-96 bg-gray-800 rounded-xl shadow-lg flex flex-col border border-gray-700 overflow-hidden transform hover:scale-105 hover:border-blue-500 transition-all duration-300">

      {/* Portrait Section */}
      <div className="h-2/5 relative">
        <img src={portraitUrl} alt={`${name} portrait`} className="w-full h-full object-cover" />
        <div className={`absolute top-2 right-2 px-3 py-1 text-xs font-bold rounded-full shadow-md ${getRoleColor(role)}`}>
          {role}
        </div>
      </div>

      {/* Info Section */}
      <div className="h-3/5 p-4 flex flex-col">
        <h2 className="text-2xl font-bold text-white">{name}</h2>
        <p className="text-md text-gray-400 -mt-1">{className}</p>
        <p className="text-xs text-gray-300 mt-2 flex-grow">{description}</p>

        {/* HP Bar */}
        <div className="w-full mt-auto">
          <div className="w-full bg-gray-900 rounded-full h-4 border border-gray-600">
            <div
              className="bg-green-500 h-full rounded-full transition-width duration-500"
              style={{ width: `${healthPercentage}%` }}
            ></div>
          </div>
          <p className="text-center text-xs font-semibold text-gray-300 mt-1">
            {hp} / {maxHp} HP
          </p>
        </div>
      </div>
    </div>
  );
};

export default CharacterCard;
