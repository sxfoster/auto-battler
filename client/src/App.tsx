import React, { useState } from 'react';
import TownHub from './components/TownHub';
import PreBattleSetup from './components/PreBattleSetup';
import BattleViewer from './components/BattleViewer';
import { UnitState } from '../shared/models/UnitState';
import { MOCK_HEROES } from '../game/src/logic/mock-data';

function App() {
  const [activeScreen, setActiveScreen] = useState<'town' | 'pre-battle' | 'battle'>('town');
  const [savedParty, setSavedParty] = useState<UnitState[]>([MOCK_HEROES.RANGER, MOCK_HEROES.BARD]); // Start with mock data
  const [battleLog, setBattleLog] = useState<any[]>([]);

  // Callback for the "Battle" button in TownHub
  const navigateToPreBattle = () => {
    if (savedParty.length > 0) {
      setActiveScreen('pre-battle');
    } else {
      alert("You must have a party saved to start a battle!");
    }
  };

  // Callback for the "Start Battle" button in PreBattleSetup
  const startBattle = (positionedParty: UnitState[]) => {
    console.log("Starting battle with this positioned party:", positionedParty);
    //
    // DEVELOPER NOTE: When Milestone 2 is complete, the line below will be uncommented.
    // const log = battleSimulator(positionedParty, [MOCK_ENEMIES.GOBLIN]);
    // setBattleLog(log);
    //
    setActiveScreen('battle');
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'pre-battle':
        return <PreBattleSetup initialParty={savedParty} onStartBattle={startBattle} />;
      case 'battle':
        // The BattleViewer will be mostly empty until the simulator is integrated
        return <BattleViewer log={battleLog} />;
      case 'town':
      default:
        // Pass the navigation function to the TownHub
        return <TownHub onStartSkirmish={navigateToPreBattle} />;
    }
  };

  return <div>{renderScreen()}</div>;
}

export default App;
