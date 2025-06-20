import React, { useEffect } from 'react';
import Card from '../components/Card';
import useBattleLogic from '../hooks/useBattleLogic';
import useGameStore from '../store/useGameStore';

const DEFAULT_TURN_DELAY = 1000;

function BattleScene({ turnDelay = DEFAULT_TURN_DELAY }) {
  const {
    battleState,
    battleLog,
    isBattleOver,
    nextTurn,
  } = useBattleLogic();

  const handleBattleComplete = useGameStore((state) => state.handleBattleComplete);

  useEffect(() => {
    if (!isBattleOver) {
      const timer = setTimeout(() => {
        nextTurn();
      }, turnDelay);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        handleBattleComplete();
      }, turnDelay);
      return () => clearTimeout(timer);
    }
  }, [battleLog, isBattleOver, nextTurn, handleBattleComplete, turnDelay]);

  return (
    <div className="battle-scene">
      {isBattleOver ? (
        <div className="battle-end-screen">
          <h2>Battle Complete</h2>
        </div>
      ) : (
        <>
          <div className="teams-container">
            <div className="team player-team">
              {battleState
                .filter((c) => c.team === 'player')
                .map((combatant) => (
                  <Card
                    key={combatant.id}
                    view="compact"
                    {...combatant}
                    isActive={combatant.isActive}
                    isTakingDamage={combatant.isTakingDamage}
                  />
                ))}
            </div>
            <div className="team enemy-team">
              {battleState
                .filter((c) => c.team === 'enemy')
                .map((combatant) => (
                  <Card
                    key={combatant.id}
                    view="compact"
                    {...combatant}
                    isActive={combatant.isActive}
                    isTakingDamage={combatant.isTakingDamage}
                  />
                ))}
            </div>
          </div>
          <div className="battle-log">
            {battleLog.map((entry, index) => (
              <p key={index}>{entry}</p>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default BattleScene;
