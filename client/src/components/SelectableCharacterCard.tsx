import React from 'react'
import type { Character } from '../../../shared/models/Character'
import { classes as allClasses } from '../../../shared/models/classes.js'
import defaultPortrait from '../../../shared/images/default-portrait.png'
import './SelectableCharacterCard.css'

interface CharacterCardProps {
  character: Character;
  onSelect: (character: Character) => void;
  isSelected: boolean;
  isDisabled: boolean; // To disable selection if party is full
}

const SelectableCharacterCard: React.FC<CharacterCardProps> = ({ character, onSelect, isSelected, isDisabled }) => {
  const roleColors: Record<string, string> = {
    Tank: '#2980b9',
    Healer: '#27ae60',
    Support: '#9b59b6',
    DPS: '#e74c3c',
  }

  const clsInfo = allClasses.find((c) => c.id === character.class)
  if (!clsInfo) {
    console.warn(`Unknown class id: ${character.class}`)
  }
  const roleColor = roleColors[clsInfo?.role || 'DPS']

  const containerStyle: React.CSSProperties = {
    // expose the role color to CSS via custom property
    ['--role-color' as any]: roleColor,
  }

  const handleClick = () => {
    if (!isDisabled || isSelected) {
      onSelect(character);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault(); // Prevent scrolling on spacebar
      handleClick();
    }
  };

  const badgeStyle: React.CSSProperties = {
    position: 'absolute',
    top: '5px',
    right: '5px',
    backgroundColor: roleColor,
    color: '#fff',
    padding: '2px 6px',
    borderRadius: '12px',
    fontSize: '0.7em',
  }

  const desc = character.description || 'No description available.'

  const classes = ['character-card']
  if (isSelected) classes.push('selected')
  if (isDisabled && !isSelected) classes.push('disabled')

  return (
    <div
      className={classes.join(' ')}
      style={containerStyle}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={isDisabled && !isSelected ? -1 : 0}
      role="button"
      aria-pressed={isSelected}
      aria-disabled={isDisabled && !isSelected}
      aria-label={`Select character ${character.name}, class ${clsInfo?.name ?? character.class}. ${desc}`}
    >
      <div style={{ position: 'relative', marginBottom: '10px' }}>
        <img
          className="character-card__portrait"
          src={character.portrait || clsInfo?.portrait || defaultPortrait}
          alt={character.name}
          title={clsInfo?.name ?? character.class}
          onError={(e) => {
            if (e.currentTarget.src !== defaultPortrait) {
              e.currentTarget.src = defaultPortrait
            }
          }}
        />
        <span style={badgeStyle}>{clsInfo?.role}</span>
      </div>
      <div className="character-card__info">
        <div className="character-card__name">{character.name}</div>
        <p className="character-card__class">{clsInfo?.name ?? character.class}</p>
        <p
          className="character-card__description"
          style={{ fontStyle: !character.description ? 'italic' : 'normal' }}
        >
          {desc}
        </p>
      </div>
    </div>
  )
};

export default SelectableCharacterCard;
