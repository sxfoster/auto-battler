import React, { useRef, useEffect } from 'react';
import Phaser from 'phaser';
import BattleScene from 'game/src/scenes/BattleScene';
import BattleHUD from '../components/BattleHUD';
// Use the game workspace's party state utilities directly
import { loadPartyState } from '../../../game/src/shared/partyState.js';
// Use the game workspace's saved game state utilities directly
import { loadGameState } from 'game/src/state.js';

export default function Battle() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const phaserRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    loadPartyState();
    loadGameState();

    if (!containerRef.current) return;
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: containerRef.current,
      scene: [BattleScene],
    });
    phaserRef.current = game;
    (window as any).__phaserGame = game;

    return () => {
      game.destroy(true);
    };
  }, []);

  return (
    <div className="battle-page">
      <div className="battle-container">
        <div ref={containerRef} className="phaser-container" />
        <BattleHUD />
      </div>
    </div>
  );
}
