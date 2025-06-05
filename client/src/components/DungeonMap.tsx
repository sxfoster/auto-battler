import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import DungeonScene from '../phaser/DungeonScene';
import { generateDungeon } from '../phaser/generateDungeon';

interface DungeonMapProps {
  onPlayerMove?: (pos: { x: number; y: number }) => void;
}

const DungeonMap: React.FC<DungeonMapProps> = ({ onPlayerMove }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const dungeon = generateDungeon();
    const scene = new DungeonScene({ dungeon, onPlayerMove });
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: dungeon.width * 32,
      height: dungeon.height * 32,
      parent: containerRef.current!,
      scene,
    });

    return () => {
      game.destroy(true);
    };
  }, [onPlayerMove]);

  return <div ref={containerRef} aria-label="Dungeon map" />;
};

export default DungeonMap;
