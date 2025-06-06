import React from 'react';
import type { PartyCharacter } from './PartySetup';
import { classes as allClasses } from '../../../shared/models/classes.js';
import styles from './PartySummary.module.css';

interface PartySummaryProps {
  selectedCharacters: PartyCharacter[];
}

const roleColors: Record<string, string> = {
  Tank: '#2980b9',
  Healer: '#27ae60',
  Support: '#9b59b6',
  DPS: '#e74c3c',
};

const getRole = (classId: string): string => {
  const cls = allClasses.find(c => c.id === classId);
  return cls?.role ?? 'Unknown';
};

const getClassName = (classId: string): string => {
  const cls = allClasses.find(c => c.id === classId);
  return cls?.name ?? classId;
};

const calculateAverage = (values: Array<number | undefined>): string => {
  const valid = values.filter(v => v !== undefined) as number[];
  if (valid.length === 0) return '—';
  const sum = valid.reduce((acc, v) => acc + v, 0);
  return (sum / valid.length).toFixed(2);
};

const PartySummary: React.FC<PartySummaryProps> = ({ selectedCharacters }) => {
  if (selectedCharacters.length === 0) {
    return (
      <div className={styles.summaryContainer} aria-live="polite" aria-atomic="true">
        <h2 className={styles.heading}>Party Summary</h2>
        <p style={{ textAlign: 'center', fontStyle: 'italic', color: '#bbb' }}>
          No characters selected yet to display a summary.
        </p>
      </div>
    );
  }

  const averageHp = calculateAverage(selectedCharacters.map(c => c.stats.hp));
  const averageEnergy = calculateAverage(selectedCharacters.map(c => c.stats.energy));
  const averageAttack = calculateAverage(selectedCharacters.map(c => c.stats.attack));
  const averageDefense = calculateAverage(selectedCharacters.map(c => c.stats.defense));
  const averageSpeed = calculateAverage(selectedCharacters.map(c => c.stats.speed));

  return (
    <div className={styles.summaryContainer} aria-live="polite" aria-atomic="true">
      <h2 className={styles.heading}>Party Summary</h2>
      <div className={styles.statsList}>
        <div className={styles.statItem} title="Average of party health points">
          <strong>Avg HP:</strong> {averageHp}
        </div>
        <div className={styles.statItem} title="Average energy available each turn">
          <strong>Avg Energy:</strong> {averageEnergy}
        </div>
        <div className={styles.statItem} title="Average attack across party members">
          <strong>Avg Attack:</strong> {averageAttack}
        </div>
        <div className={styles.statItem} title="Average defense across party members">
          <strong>Avg Defense:</strong> {averageDefense}
        </div>
        <div className={styles.statItem} title="Average speed across party members">
          <strong>Avg Speed:</strong> {averageSpeed}
        </div>
      </div>
      <div className={styles.divider}></div>
      {selectedCharacters.map(character => {
        const role = getRole(character.class);
        const badgeStyle = { backgroundColor: roleColors[role] } as React.CSSProperties;
        const initials = character.name
          .split(' ')
          .map(w => w[0])
          .join('')
          .slice(0, 2)
          .toUpperCase();
        return (
          <div key={character.id} className={styles.characterItem}>
            {character.portrait ? (
              <img
                src={character.portrait}
                alt={character.name}
                className={styles.characterIcon}
              />
            ) : (
              <div className={styles.characterIcon}>{initials}</div>
            )}
            <div>
              <strong>{character.name}</strong>
              <div>
                {getClassName(character.class)}
                <span className={styles.roleBadge} style={badgeStyle}>{role}</span>
              </div>
              <ul className={styles.cardList}>
                {character.assignedCards.map(card => (
                  <li key={card.id} className={styles.cardPill} title={card.description}>
                    {card.name}
                  </li>
                ))}
                {character.assignedCards.length === 0 && (
                  <li className={styles.cardPill} style={{ opacity: 0.7, fontStyle: 'italic' }} title="No cards assigned">
                    No cards
                  </li>
                )}
              </ul>
            </div>
            <div className={styles.characterActions}>
              <button className={styles.actionButton} aria-label={`Remove ${character.name}`}>❌</button>
              <button className={styles.actionButton} aria-label={`Edit ${character.name}`}>✏️</button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PartySummary;
