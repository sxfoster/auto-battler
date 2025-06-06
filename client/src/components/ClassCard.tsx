import React from 'react';
import type { GameClass } from '../utils/randomizeClasses';
import styles from './PartySetup.module.css';

interface ClassCardProps {
  cls: GameClass;
  onSelect: (cls: GameClass) => void;
  disabled?: boolean;
}

const roleColors: Record<string, string> = {
  Tank: '#2980b9',
  Healer: '#27ae60',
  Support: '#9b59b6',
  DPS: '#e74c3c',
};

const ClassCard: React.FC<ClassCardProps> = ({ cls, onSelect, disabled }) => {
  return (
    <div
      className={`${styles.classCard} ${disabled ? styles.disabledCard : ''}`}
      style={{ '--role-color': roleColors[cls.role] } as React.CSSProperties}
      onClick={() => !disabled && onSelect(cls)}
    >
      <span className={styles.roleBadge}>{cls.role}</span>
      <strong>{cls.name}</strong>
      <p style={{ fontStyle: cls.description ? 'normal' : 'italic', fontSize: '0.8rem' }}>
        {cls.description || 'No description available.'}
      </p>
    </div>
  );
};

export default ClassCard;
