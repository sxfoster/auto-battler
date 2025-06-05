import React from 'react';
import type { PartyCharacter } from './PartySetupScreen'; // Assuming PartyCharacter is exported or defined appropriately
import type { Card } from '../../../shared/models/Card';
import CardDisplay from './CardDisplay';

interface CardAssignmentPanelProps {
  character: PartyCharacter; // Character from selectedCharacters array
  availableCards: Card[]; // Full list of cards from game data
  onAssignCard: (characterId: string, card: Card) => void;
  onRemoveCard: (characterId:string, cardId: string) => void;
}

const CardAssignmentPanel: React.FC<CardAssignmentPanelProps> = ({ character, availableCards, onAssignCard, onRemoveCard }) => {
  const assignedCardIds = new Set(character.assignedCards.map(c => c.id));
  const canAssignMoreCards = character.assignedCards.length < 4;

  const panelStyle: React.CSSProperties = {
    // Using existing styles from PartySetupScreen.module.css for selectedCharacterPanel as a base
    // backgroundColor: '#ecf0f1', // Already handled by parent
    // padding: '15px', // Already handled by parent
    // marginBottom: '15px', // Already handled by parent
    // borderRadius: '8px', // Already handled by parent
    // boxShadow: '0 2px 4px rgba(0,0,0,0.1)', // Already handled by parent
  };

  const subSectionTitleStyle: React.CSSProperties = {
    fontSize: '1.1em',
    color: '#2c3e50',
    marginTop: '15px',
    marginBottom: '10px',
    borderBottom: '1px solid #bdc3c7',
    paddingBottom: '5px',
  };

  const cardListStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px', // Spacing between cards
    marginBottom: '15px',
  };

  const assignedCardWrapperStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column', // Stack card and button vertically
    alignItems: 'center', // Center button below card
    padding: '5px',
    border: '1px solid #bdc3c7',
    borderRadius: '6px',
    backgroundColor: '#fdfdfd',
  };

  const removeCardButtonStyle: React.CSSProperties = {
    marginTop: '8px',
    padding: '6px 10px',
    fontSize: '0.8em',
    color: 'white',
    backgroundColor: '#e74c3c', // Red
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  };

  const availableCardsListStyle: React.CSSProperties = {
    ...cardListStyle, // Reuse common styles
    maxHeight: '220px', // Slightly increased height
    overflowY: 'auto',
    padding: '5px',
    backgroundColor: '#ffffff',
    border: '1px dashed #bdc3c7',
    borderRadius: '4px',
  };

  return (
    <div style={panelStyle}>
      {/* Character's name and card count is now part of characterPanelHeader in PartySetupScreen.tsx */}
      {/* This h4 can be removed if redundant: <h4>{character.name}'s Cards ({character.assignedCards.length}/4)</h4> */}

      <h5 style={subSectionTitleStyle}>Assigned Cards:</h5>
      {character.assignedCards.length === 0 && <p style={{fontStyle: 'italic', color: '#7f8c8d'}}>No cards assigned yet.</p>}
      <div style={cardListStyle}>
        {character.assignedCards.map(card => (
          <div key={card.id} style={assignedCardWrapperStyle}>
            <CardDisplay
              card={card}
              onSelect={() => {}}
              isSelected={true} // Visually mark as "selected" or "active" in this context
              isDisabled={true}
            />
            <button
              onClick={() => onRemoveCard(character.id, card.id)}
              style={removeCardButtonStyle}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c0392b'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e74c3c'}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <h5 style={subSectionTitleStyle}>Available Cards to Assign (Pick up to 4):</h5>
      {!canAssignMoreCards && <p style={{fontStyle: 'italic', color: '#7f8c8d'}}>Maximum cards assigned for this character.</p>}
      <div style={availableCardsListStyle}>
        {canAssignMoreCards && availableCards.map(card => {
          const isAssignedToThisCharacter = assignedCardIds.has(card.id);
          return (
            <CardDisplay
              key={card.id}
              card={card}
              onSelect={() => onAssignCard(character.id, card)}
              isSelected={false}
              isDisabled={isAssignedToThisCharacter}
            />
          );
        })}
         {canAssignMoreCards && availableCards.filter(c => !assignedCardIds.has(c.id)).length === 0 && <p style={{fontStyle: 'italic', color: '#7f8c8d'}}>No more unique cards available to assign.</p>}
      </div>
    </div>
  );
};

export default CardAssignmentPanel;
