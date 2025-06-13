import React from 'react';
import Pack from '../ui/Pack.jsx';

export default function PackScene({ gameState, onOpen }) {
  const isWeaponStage = gameState.includes('WEAPON');
  const title = isWeaponStage ?
    (gameState === 'WEAPON_1_PACK' ? 'Open Weapon Pack' : 'Open Pack for Second Weapon') :
    (gameState === 'HERO_1_PACK' ? 'Open Your Hero Pack' : 'Open Pack for Second Hero');
  const packType = isWeaponStage ? 'weapon' : 'hero';

  return (
    <div className="scene">
      <h1 className="text-5xl font-cinzel tracking-wider mb-8 text-center">{title}</h1>
      <Pack packType={packType} onOpen={onOpen} />
      <p className="text-lg text-gray-400 mt-8">Click the pack to begin.</p>
    </div>
  );
}
