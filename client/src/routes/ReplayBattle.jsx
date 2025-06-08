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

    return () => {
      game.destroy(true);
    };
  }, []);

  return (
    <div className="battle-page">
      <div ref={container} className="phaser-container" />
      <BattleHUD />
    </div>
  );
}
