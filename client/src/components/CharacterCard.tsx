import React from 'react';
import styles from './CharacterCard.module.css';

interface CharacterCardProps {
  name: string;
  heroClass: string;
  role: 'DPS' | 'Support' | 'Tank' | 'Healer';
  portrait?: string;
  description?: string;
  hp: number;
  maxHp: number;
}

const ROLE_COLORS: Record<string, string> = {
  DPS: '#c53d38',
  Support: '#9b59b6',
  Tank: '#2980b9',
  Healer: '#27ae60',
};

const CharacterCard: React.FC<CharacterCardProps> = ({
  name,
  heroClass,
  role,
  portrait = '/hero-placeholder.svg',
  description = '',
  hp,
  maxHp,
}) => {
  const badgeColor = ROLE_COLORS[role] || ROLE_COLORS.DPS;
  return (
    <div
      className={styles.characterCard}
      style={{ '--badge-color': badgeColor } as React.CSSProperties}
    >
      <img src={portrait} alt={`${name} portrait`} className={styles.portrait} />
      <span className={styles.badge}>{role}</span>
      <div className={styles.name}>{name}</div>
      <div className={styles.subtitle}>{heroClass}</div>
      <div className={styles.desc}>{description}</div>
      <div className={styles.hpBar} aria-label={`${hp} of ${maxHp} HP`}>
        <span role="img" aria-label="Heart">
          ❤️
        </span>
        <span>
          {hp} / {maxHp}
        </span>
      </div>
    </div>
  );
};

export default CharacterCard;
