import React, { useState } from 'react';
import PackScene from './components/scenes/PackScene.jsx';
import DraftScene from './components/scenes/DraftScene.jsx';
import BattleScene from './components/scenes/BattleScene.jsx';
import ConfirmationBar from './components/ui/ConfirmationBar.jsx';
import { allPossibleHeroes, allPossibleWeapons } from './data/cardData.js';

function App() {
  const [gameState, setGameState] = useState('HERO_1_PACK');
  const [team, setTeam] = useState({ hero1: null, weapon1: null, hero2: null, weapon2: null });
  const [draftOptions, setDraftOptions] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const openPack = () => {
    const isWeapon = gameState.includes('WEAPON');
    const data = isWeapon ? allPossibleWeapons : allPossibleHeroes;
    const choices = [...data].sort(() => 0.5 - Math.random()).slice(0, isWeapon ? 3 : 4);
    setDraftOptions(choices);
    setGameState(prev => prev.replace('PACK', 'DRAFT'));
  };

  const advanceDraft = (selection) => {
    setTeam(prev => {
      const newTeam = { ...prev };
      if (gameState === 'HERO_1_DRAFT') newTeam.hero1 = selection.id;
      else if (gameState === 'WEAPON_1_DRAFT') newTeam.weapon1 = selection.id;
      else if (gameState === 'HERO_2_DRAFT') newTeam.hero2 = selection.id;
      else if (gameState === 'WEAPON_2_DRAFT') newTeam.weapon2 = selection.id;
      return newTeam;
    });

    switch (gameState) {
      case 'HERO_1_DRAFT':
        setGameState('WEAPON_1_PACK');
        break;
      case 'WEAPON_1_DRAFT':
        setGameState('HERO_2_PACK');
        break;
      case 'HERO_2_DRAFT':
        setGameState('WEAPON_2_PACK');
        break;
      case 'WEAPON_2_DRAFT':
        setGameState('BATTLE');
        setShowConfirmation(true);
        break;
      default:
        break;
    }
  };

  const startBattle = () => {
    setShowConfirmation(false);
    setGameState('BATTLE');
  };

  return (
    <div className="app-container">
      {gameState.includes('PACK') && (
        <PackScene gameState={gameState} onOpen={openPack} />
      )}
      {gameState.includes('DRAFT') && (
        <DraftScene options={draftOptions} onCardSelect={advanceDraft} />
      )}
      {gameState === 'BATTLE' && <BattleScene team={team} />}
      {showConfirmation && <ConfirmationBar onConfirm={startBattle} />}
    </div>
  );
}

export default App;
