import React from 'react'
import type { Character } from '../../../shared/models/Character'
import { classes as allClasses } from '../../../shared/models/classes.js'
import defaultPortrait from '../../../shared/images/default-portrait.png'

interface CharacterCardProps {
  character: Character;
  onSelect: (character: Character) => void;
  isSelected: boolean;
  isDisabled: boolean; // To disable selection if party is full
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character, onSelect, isSelected, isDisabled }) => {
  const roleColors: Record<string, string> = {
    Tank: '#2980b9',
    Healer: '#27ae60',
    Support: '#9b59b6',
    DPS: '#e74c3c',
  }

  const clsInfo = allClasses.find((c) => c.id === character.class)
  const roleColor = roleColors[clsInfo?.role || 'DPS']

  const cardStyle: React.CSSProperties = {
    border: isSelected ? `3px solid ${roleColor}` : '1px solid #bdc3c7',
    padding: '15px',
    margin: '5px',
    cursor: isDisabled && !isSelected ? 'not-allowed' : 'pointer',
    opacity: isDisabled && !isSelected ? 0.5 : 1,
    width: '180px',
    textAlign: 'center' as React.CSSProperties['textAlign'],
    borderRadius: '12px',
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  }

  // For a hover effect with inline styles, you'd need onMouseEnter/onMouseLeave handlers
  // to change a state variable that adjusts the style. CSS modules are better for this.
  // For now, this is a static style.

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

  return (
    <div
      style={cardStyle}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={isDisabled && !isSelected ? -1 : 0}
      role="button"
      aria-pressed={isSelected}
      aria-disabled={isDisabled && !isSelected}
      aria-label={`Select character ${character.name}, class ${clsInfo?.name ?? character.class}. ${desc}`}
      onMouseEnter={(e) => {
        if (!isDisabled || isSelected) {
          e.currentTarget.style.transform = 'scale(1.03)'
          e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.15)'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)'
      }}
    >
      <div style={{ position: 'relative', marginBottom: '10px' }}>
        <img
          src={character.portrait || defaultPortrait}
          alt={character.name}
          title={clsInfo?.name ?? character.class}
          onError={(e) => {
            if (e.currentTarget.src !== defaultPortrait) {
              e.currentTarget.src = defaultPortrait
            }
          }}
          style={{ width: '110px', height: '110px', objectFit: 'cover', borderRadius: '50%', border: `3px solid ${roleColor}` }}
        />
        <span style={badgeStyle}>{clsInfo?.role}</span>
      </div>
      <h3 style={{ margin: '0 0 5px 0' }}>{character.name}</h3>
      <p style={{ color: roleColor, fontWeight: 'bold', margin: '0 0 5px 0' }}>{clsInfo?.name ?? character.class}</p>
      <p style={{ fontSize: '0.8em', height: '40px', overflow: 'hidden', fontStyle: !character.description ? 'italic' : 'normal', color: '#777' }}>
        {desc}
      </p>
    </div>
  )
};

export default CharacterCard;
