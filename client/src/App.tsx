import React, { useState } from 'react';
import TownHub from './components/TownHub';
import PreBattleSetup from './components/PreBattleSetup';
import BattleViewer from './components/BattleViewer';
import PartySetup from './components/PartySetup';
import PartyRoster from './components/PartyRoster';
import { UnitState } from '@shared/models/UnitState';
import { MOCK_HEROES, MOCK_ENEMIES } from '@shared/mock-data';
import { simulateBattle } from '../../game/src/logic/battleSimulator.js';

function App() {
  const [activeScreen, setActiveScreen] = useState<'town' | 'party-setup' | 'pre-battle' | 'battle' | 'party-roster'>('town');
  const [activeExpeditionParty, setActiveExpeditionParty] = useState<UnitState[]>([]);
  const [savedParty, setSavedParty] = useState<UnitState[]>([MOCK_HEROES.RANGER, MOCK_HEROES.BARD]); // Start with mock data
  const [battleLog, setBattleLog] = useState<any[]>([]);

  const navigateToTown = () => setActiveScreen('town');
  const navigateToPartyRoster = () => setActiveScreen('party-roster');

  // Navigate to Party Setup from the town hub
  const navigateToPartySetup = () => {
    setActiveScreen('party-setup');
  };

  // Navigate to Pre-Battle positioning from town hub
  const navigateToPreBattle = () => {
    if (savedParty.length > 0) {
      setActiveScreen('pre-battle');
    } else {
      alert('You must have a party saved to start a battle!');
    }
  };

  const handlePartySaved = (party: UnitState[]) => {
    setActiveExpeditionParty(party);
    setSavedParty(party);
    setActiveScreen('town');
  };

  // Callback for the "Start Battle" button in PreBattleSetup
  const startBattle = (positionedParty: UnitState[]) => {
    const log = simulateBattle(positionedParty, [MOCK_ENEMIES.GOBLIN]);
    setBattleLog(log);
    setActiveScreen('battle');
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'party-setup':
        return <PartySetup onPartySaved={handlePartySaved} />;
      case 'pre-battle':
        return <PreBattleSetup initialParty={savedParty} onStartBattle={startBattle} />;
      case 'battle':
        // The BattleViewer will be mostly empty until the simulator is integrated
        return <BattleViewer log={battleLog} />;
      case 'party-roster':
        return <PartyRoster onBackToTown={navigateToTown} />;
      case 'town':
      default:
        // Pass the navigation function to the TownHub
        return (
          <TownHub
            onStartSkirmish={navigateToPreBattle}
            onEnterDungeon={navigateToPartySetup}
            onNavigateToParty={navigateToPartyRoster}
          />
        );
    }
  };

  return <div>{renderScreen()}</div>;
}

export default App;
