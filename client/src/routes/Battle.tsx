import React, { useRef, useEffect } from 'react';
import Phaser from 'phaser';
import BattleScene from 'game/src/scenes/BattleScene';
import BattleHUD from '../components/BattleHUD';
import { loadPartyState } from 'shared/partyState';
import { loadGameState } from 'game/state';

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
