import React from 'react';
import type { Card } from '../../../shared/models/Card';

interface CardDisplayProps {
  card: Card;
  onSelect: (card: Card) => void;
  isSelected: boolean;
  isDisabled: boolean; // e.g., if card is already assigned to this character or max cards assigned
}

const CardDisplay: React.FC<CardDisplayProps> = ({ card, onSelect, isSelected, isDisabled }) => {
  const style: React.CSSProperties = {
    border: isSelected ? '2px solid #27ae60' : '1px solid #e0e0e0',
    padding: '10px',
    margin: '5px',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.5 : 1,
    backgroundColor: isSelected ? '#e9f7ef' : '#f9f9f9',
    borderRadius: '6px',
    boxShadow: isSelected
      ? '0 3px 6px rgba(0,0,0,0.15)'
      : '0 1px 3px rgba(0,0,0,0.05)',
    transform: isSelected ? 'scale(1.05)' : 'none',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    width: '150px',
    fontSize: '0.9em',
  }

  const handleClick = () => {
    if (!isDisabled) {
      onSelect(card);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      style={style}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={isDisabled ? -1 : 0}
      role="button"
      aria-pressed={isSelected} // This might be more like aria-checked if it's a selection from a list
      aria-disabled={isDisabled}
      aria-label={`Select card ${card.name}, type ${card.type}. ${card.description || 'No effect description.'}`}
      onMouseEnter={(e) => { if (!isDisabled) e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 3px 6px rgba(0,0,0,0.1)';}}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';}}
    >
      <strong style={{ color: '#333', display: 'block', marginBottom: '4px' }}>{card.name}</strong>
      <em style={{ color: '#555', display: 'block', marginBottom: '6px' }}>Type: {card.type}</em>
      <p style={{ fontSize: '0.85em', color: '#666', minHeight: '3em' }}>{card.description || 'No effect description.'}</p>
    </div>
  );
};

export default CardDisplay;
