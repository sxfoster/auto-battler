import React, { useEffect, useState } from 'react';
import type { PartyCharacter } from './PartySetup';
import type { Card } from '../../../shared/models/Card';
import CardDisplay from './CardDisplay';
import { canUseCard } from '../../../shared/systems/classRole.js';
import { classes as allClasses } from '../../../shared/models/classes.js';
import styles from './PartySetup.module.css';

interface CardAssignmentPanelProps {
  character: PartyCharacter; // Character from selectedCharacters array
  availableCards: Card[]; // Full list of cards from game data
  onAssignCard: (characterId: string, card: Card) => void;
  onRemoveCard: (characterId:string, cardId: string) => void;
}

const CardAssignmentPanel: React.FC<CardAssignmentPanelProps> = ({ character, availableCards, onAssignCard, onRemoveCard }) => {
  const [draftCards, setDraftCards] = useState<Card[]>([])
  const [draftKey, setDraftKey] = useState(0)

  const assignedCardIds = new Set(character.assignedCards.map((c) => c.id))
  const canAssignMoreCards = character.assignedCards.length < 2

  const getUsablePool = () => {
    return availableCards.filter(
      (c) => canUseCard(character, c) && !assignedCardIds.has(c.id)
    )
  }

  const generateDraft = () => {
    let pool = [...getUsablePool()]
    // Fallback to role-based picks if no class-restricted cards exist
    if (pool.length === 0) {
      const cls = allClasses.find(c => c.id === character.class)
      if (!cls) {
        console.warn(`Unknown class id: ${character.class}`)
      }
      if (cls) {
        pool = availableCards.filter(
          c => c.roleTag === cls.role && !assignedCardIds.has(c.id)
        )
      }
    }
    const picks: Card[] = []
    while (pool.length && picks.length < 4) {
      const idx = Math.floor(Math.random() * pool.length)
      picks.push(pool.splice(idx, 1)[0])
    }
    setDraftCards(picks)
    setDraftKey(k => k + 1)
  }

  useEffect(() => {
    generateDraft()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character.id, character.class, character.assignedCards.length, availableCards])

  const panelStyle: React.CSSProperties = {
    // Using existing styles from PartySetup.module.css for selectedCharacterPanel as a base
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
    gap: '10px', // Spacing between cards
    marginBottom: '15px',
    maxHeight: '220px', // Slightly increased height
    overflowY: 'auto',
    padding: '5px',
    backgroundColor: '#ffffff',
    border: '1px dashed #bdc3c7',
    borderRadius: '4px',
  };

  const handleDraftPick = (card: Card) => {
    if (!canAssignMoreCards) return
    onAssignCard(character.id, card)
    generateDraft()
  }

  return (
    <div style={panelStyle}>
      <h5
        style={subSectionTitleStyle}
        title="Only two cards will be available at the start of battle"
      >
        Battle Deck: {character.assignedCards.length}/2
      </h5>
      {character.assignedCards.length === 0 && (
        <p style={{ fontStyle: 'italic', color: '#7f8c8d' }}>No cards assigned yet.</p>
      )}
      <div style={cardListStyle}>
        {character.assignedCards.map((card) => (
          <div key={card.id} style={assignedCardWrapperStyle}>
            <CardDisplay card={card} onSelect={() => {}} isSelected={true} isDisabled={true} />
            <button
              onClick={() => onRemoveCard(character.id, card.id)}
              style={removeCardButtonStyle}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#c0392b')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#e74c3c')}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {canAssignMoreCards && (
        <>
          <h5 style={subSectionTitleStyle}>Draft a Card</h5>
          <div
            style={availableCardsListStyle}
            className={`${styles.fade} ${styles.draftCardsGrid}`}
            key={draftKey}
          >
            {draftCards.map((card) => (
              <CardDisplay
                key={card.id}
                card={card}
                onSelect={() => handleDraftPick(card)}
                isSelected={false}
                isDisabled={false}
              />
            ))}
            {draftCards.length === 0 && (
              <p style={{ fontStyle: 'italic', color: '#7f8c8d' }}>No more cards available.</p>
            )}
          </div>
        </>
      )}
      {!canAssignMoreCards && (
        <p style={{ fontStyle: 'italic', color: '#7f8c8d' }}>Draft complete for this character.</p>
      )}
    </div>
  )
};

export default CardAssignmentPanel;
