import React from 'react';
import Card from '../components/Card.jsx';
import BattleLog from '../components/BattleLog.jsx';
import { useGameStore } from '../store.js';

export default function BattleScene() {
  // Get the combatants and the full replay log from the store.
  // In this new model, 'combatants' will hold the state for a single moment in time,
  // and 'replayLog' holds the entire script of the battle.
  const { combatants, replayLog } = useGameStore(state => ({
    combatants: state.combatants,
    replayLog: state.replayLog,
  }));

  // If there's no data yet, show a loading or empty state.
  if (!combatants || combatants.length === 0) {
    return (
      <div className="scene">
        <h1 className="text-4xl font-cinzel">Preparing for battle...</h1>
      </div>
    );
  }

  // For this phase, we will just display the initial state of the combatants
  // as loaded from the replay log. In the next phase, we'll add turn-by-turn animation.
  
  const playerCards = combatants.filter(c => c.team === 'player');
  const enemyCards = combatants.filter(c => c.team === 'enemy');

  return (
    <div className="battle-scene" style={{ paddingTop: '2rem' }}>
      <div className="teams flex justify-around items-start w-full max-w-7xl mx-auto">
        <div className="player-team flex flex-col items-center gap-4">
          <h2 className="text-2xl font-cinzel text-blue-400">Your Team</h2>
          <div className="flex gap-4">
            {playerCards.map(c => (
              <Card
                key={c.id}
                item={c}
                view="compact"
              />
            ))}
          </div>
        </div>
        <div className="enemy-team flex flex-col items-center gap-4">
          <h2 className="text-2xl font-cinzel text-red-400">Enemy Team</h2>
          <div className="flex gap-4">
            {enemyCards.map(c => (
              <Card
                key={c.id}
                item={c}
                view="compact"
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* The BattleLog component will now display the full log from the replay */}
      <BattleLog battleLog={replayLog || []} />
    </div>
  );
}
