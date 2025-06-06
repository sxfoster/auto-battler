import React from 'react';
import type { PartyCharacter } from './PartySetup';

interface PartySummaryProps {
  selectedCharacters: PartyCharacter[];
}

const PartySummary: React.FC<PartySummaryProps> = ({ selectedCharacters }) => {
  const summaryStyle: React.CSSProperties = {
    marginTop: '30px',
    padding: '20px',
    border: '1px solid #444',
    borderRadius: '8px',
    backgroundColor: '#2a2a2a',
    boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
    color: '#f5f5f5',
  }

  const titleStyle: React.CSSProperties = {
    color: '#f5f5f5',
    borderBottom: '2px solid #3498db',
    paddingBottom: '5px',
    marginBottom: '20px', // Increased margin
    fontSize: '1.6em', // Slightly smaller than main section titles
    textAlign: 'center' as React.CSSProperties['textAlign'],
  };

  const characterItemStyle: React.CSSProperties = {
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#383838',
    padding: '8px',
    borderRadius: '6px',
  }

  const cardListStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    margin: 0,
    padding: 0,
    listStyle: 'none',
  }


  if (selectedCharacters.length === 0) {
    return (
      <div className="party-summary" style={summaryStyle} aria-live="polite" aria-atomic="true">
        <h2 style={titleStyle}>Party Summary</h2>
        <p style={{ textAlign: 'center', fontStyle: 'italic', color: '#bbb' }}>
          No characters selected yet to display a summary.
        </p>
      </div>
    )
  }

  let totalAttack = 0;
  let attackCount = 0;
  let totalDefense = 0;
  let defenseCount = 0;

  selectedCharacters.forEach(character => {
    if (character.stats.attack !== undefined) {
      totalAttack += character.stats.attack;
      attackCount++;
    }
    if (character.stats.defense !== undefined) {
      totalDefense += character.stats.defense;
      defenseCount++;
    }
  });

  const averageAttack = attackCount > 0 ? (totalAttack / attackCount).toFixed(2) : 'N/A';
  const averageDefense = defenseCount > 0 ? (totalDefense / defenseCount).toFixed(2) : 'N/A';

  return (
    <div className="party-summary" style={summaryStyle} aria-live="polite" aria-atomic="true">
      <h2 style={titleStyle}>Party Summary</h2>
      <p style={{ textAlign: 'center', marginBottom: '15px', fontSize: '1.1em' }}>Total Characters: {selectedCharacters.length}</p>

      <h3 style={{ color: '#f5f5f5', marginBottom: '5px' }}>Overall Party Stats:</h3>
      <p style={{ marginLeft: '10px' }}>Average Attack: <strong>{averageAttack}</strong></p>
      <p style={{ marginLeft: '10px', marginBottom: '20px' }}>Average Defense: <strong>{averageDefense}</strong></p>

      <h3 style={{ color: '#f5f5f5', marginBottom: '10px' }}>Selected Characters & Cards:</h3>
      {selectedCharacters.map((character) => (
        <div key={character.id} style={characterItemStyle}>
          <img src={character.portrait || 'default-portrait.png'} alt={character.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #3498db' }} />
          <div>
            <strong style={{ color: '#fff', fontSize: '1em' }}>{character.name}</strong>
            <ul style={cardListStyle}>
              {character.assignedCards.map((card) => (
                <li key={card.id} style={{ backgroundColor: '#555', padding: '2px 6px', borderRadius: '12px', fontSize: '0.75em', color: '#fff' }} title={card.description}>
                  {card.name}
                </li>
              ))}
              {character.assignedCards.length === 0 && (
                <li style={{ fontStyle: 'italic', color: '#ccc' }}>No cards</li>
              )}
            </ul>
          </div>
        </div>
      ))}
    </div>
  )
};

export default PartySummary;
