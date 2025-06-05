import React from 'react';
import type { Character } from '../../../shared/models/Character';
// Optional: import a CSS module for styling
// import styles from './CharacterCard.module.css';

interface CharacterCardProps {
  character: Character;
  onSelect: (character: Character) => void;
  isSelected: boolean;
  isDisabled: boolean; // To disable selection if party is full
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character, onSelect, isSelected, isDisabled }) => {
  const cardStyle: React.CSSProperties = {
    border: isSelected ? '3px solid #3498db' : '1px solid #bdc3c7', // Blue border if selected
    padding: '15px',
    margin: '5px',
    cursor: isDisabled && !isSelected ? 'not-allowed' : 'pointer',
    opacity: isDisabled && !isSelected ? 0.5 : 1,
    width: '180px', // Slightly wider
    textAlign: 'center' as React.CSSProperties['textAlign'],
    borderRadius: '8px',
    backgroundColor: isSelected ? '#eaf5ff' : '#ffffff', // Light blue background if selected
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    // Add a hover effect using pseudo-classes if using CSS modules, or manage via JS for inline
  };

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

  return (
    <div
      style={cardStyle}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={isDisabled && !isSelected ? -1 : 0} // Only focusable if interactive
      role="button"
      aria-pressed={isSelected}
      aria-disabled={isDisabled && !isSelected}
      // Add aria-label or ensure content is descriptive enough
      aria-label={`Select character ${character.name}, class ${character.class}. ${character.description}`}
      onMouseEnter={(e) => { if (!isDisabled || isSelected) e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.15)';}}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';}}
    >
      <img src={character.portrait || 'default-portrait.png'} alt={character.name} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%', marginBottom: '10px' }} />
      <h3>{character.name}</h3>
      <p style={{color: '#555'}}>{character.class}</p>
      <p style={{ fontSize: '0.8em', height: '40px', overflow: 'hidden', color: '#777' }}>{character.description}</p>
    </div>
  );
};

export default CharacterCard;
