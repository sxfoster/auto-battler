import { useState, useRef, useCallback, useEffect } from 'react';
import GameEngine from '../game/engine.js';

export default function useBattleLogic(initialCombatants = []) {
  const engineRef = useRef(null);
  const iteratorRef = useRef(null);

  const [battleState, setBattleState] = useState(() => initialCombatants.map(c => ({ ...c })));
  const [battleLog, setBattleLog] = useState([]);
  const [isBattleOver, setIsBattleOver] = useState(false);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    engineRef.current = new GameEngine(initialCombatants);
    iteratorRef.current = engineRef.current.runGameSteps();
    const first = iteratorRef.current.next().value;
    if (first && first.combatants) {
      setBattleState(first.combatants);
      setBattleLog(first.log);
    } else {
      setBattleState(initialCombatants.map(c => ({ ...c })));
    }
    setIsBattleOver(engineRef.current.isBattleOver);
    setWinner(engineRef.current.winner);
  }, [initialCombatants]);

  const processTurn = useCallback(() => {
    if (!iteratorRef.current || engineRef.current.isBattleOver) return;
    const step = iteratorRef.current.next().value;
    if (!step) return;
    if (step.type === 'PAUSE') return;
    if (step.combatants) setBattleState(step.combatants);
    if (step.log) setBattleLog((log) => [...log, ...step.log]);
    setIsBattleOver(engineRef.current.isBattleOver);
    setWinner(engineRef.current.winner);
  }, []);

  return { battleState, battleLog, isBattleOver, winner, processTurn };
}
