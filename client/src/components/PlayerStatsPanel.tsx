import React from 'react';
import styles from './PlayerStatsPanel.module.css';

interface PlayerStatsPanelProps {
  position: { x: number; y: number };
  hp: number;
  energy: number;
}

const PlayerStatsPanel: React.FC<PlayerStatsPanelProps> = ({ position, hp, energy }) => (
  <div className={styles.panel}>
    <h2>Player Stats</h2>
    <div className={styles.stat}>HP: {hp}</div>
    <div className={styles.stat}>Energy: {energy}</div>
    <div className={styles.stat}>Position: {position.x}, {position.y}</div>
  </div>
);

export default PlayerStatsPanel;
