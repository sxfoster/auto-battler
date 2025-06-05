import React, { useState } from 'react';
import DungeonMap from './DungeonMap';
import PlayerStatsPanel from './PlayerStatsPanel';
import styles from './DungeonPage.module.css';

const DungeonPage: React.FC = () => {
  const [position, setPosition] = useState({ x: 1, y: 1 });

  return (
    <div className={styles.container}>
      <div className={styles.mapArea}>
        <DungeonMap onPlayerMove={setPosition} />
      </div>
      <div className={styles.sidebar}>
        <PlayerStatsPanel position={position} hp={100} energy={3} />
      </div>
    </div>
  );
};

export default DungeonPage;
