import React from 'react';

interface EnterDungeonButtonProps {
  onClick: () => void;
}

const EnterDungeonButton: React.FC<EnterDungeonButtonProps> = ({ onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="w-80 h-40 border-4 border-gray-600 rounded-xl bg-gray-800 flex flex-col items-center justify-center text-center p-4 cursor-pointer shadow-lg hover:border-purple-500 hover:shadow-purple-500/20 transition-all duration-300 transform hover:scale-105"
    >
      {/* This could be replaced with an actual image of a portal later */}
      <div className="w-16 h-16 bg-purple-600 rounded-full mb-2 animate-pulse"></div>
      <h2 className="text-2xl font-bold text-white">Enter Dungeon</h2>
      <p className="text-sm text-gray-400">Begin a new adventure</p>
    </div>
  );
};

export default EnterDungeonButton;
