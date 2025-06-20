import React from 'react';
import PackScene from './PackScene';
import DraftScene from './DraftScene';
import BattleScene from './BattleScene';
import { useGameStore } from './store';
import './style.css';

export default function App() {
  const gamePhase = useGameStore((state) => state.gamePhase);

  switch (gamePhase) {
    case 'BATTLE':
      return <BattleScene />;
    case 'DRAFT':
      return <DraftScene />;
    case 'PACK':
    default:
      return <PackScene />;
  }
}
