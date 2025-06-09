import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import BattleScene from 'game/src/scenes/BattleScene';
import BattleHUD from '../components/BattleHUD';

export default function ReplayBattle() {
  const container = useRef(null);

  useEffect(() => {
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: container.current,
      scene: [BattleScene],
    });
    window.__phaserGame = game;

    return () => {
      game.destroy(true);
      if (window.__phaserGame === game) {
        delete window.__phaserGame;
      }
    };
  }, []);

  return (
    <div className="battle-page">
      <div ref={container} className="phaser-container" />
      <BattleHUD />
    </div>
  );
}
