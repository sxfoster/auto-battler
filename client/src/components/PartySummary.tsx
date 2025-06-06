import React from 'react';
import type { PartyCharacter } from './PartySetup';

interface PartySummaryProps {
  selectedCharacters: PartyCharacter[];
}

const PartySummary: React.FC<PartySummaryProps> = ({ selectedCharacters }) => {
  const summaryStyle: React.CSSProperties = {
    marginTop: '30px',
    padding: '20px',
    border: '1px solid #bdc3c7', // Consistent with other borders
    borderRadius: '8px',
    backgroundColor: '#f9fafb', // Very light grey, almost white
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)', // Subtle shadow
  };

  const titleStyle: React.CSSProperties = {
    color: '#34495e', // From PartySetup.module.css sectionTitle
    borderBottom: '2px solid #3498db', // From PartySetup.module.css sectionTitle
    paddingBottom: '5px',
    marginBottom: '20px', // Increased margin
    fontSize: '1.6em', // Slightly smaller than main section titles
    textAlign: 'center' as React.CSSProperties['textAlign'],
  };

  const characterItemStyle: React.CSSProperties = {
    marginBottom: '15px',
    paddingLeft: '15px',
    borderLeft: '3px solid #3498db', // Blue accent line
  };

  const cardListStyle: React.CSSProperties = {
    listStyleType: 'disc', // Default disc
    paddingLeft: '20px', // Indent list items
    color: '#555',
  };


  if (selectedCharacters.length === 0) {
    return (
      <div
        className="party-summary"
        style={summaryStyle}
        aria-live="polite"
        aria-atomic="true"
      >
        <h2 style={titleStyle}>Party Summary</h2>
        <p style={{textAlign: 'center', fontStyle: 'italic', color: '#7f8c8d'}}>No characters selected yet to display a summary.</p>
      </div>
    );
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
    <div
      className="party-summary"
      style={summaryStyle}
      aria-live="polite"
      aria-atomic="true"
    >
      <h2 style={titleStyle}>Party Summary</h2>
      <p style={{textAlign: 'center', marginBottom: '15px', fontSize: '1.1em'}}>Total Characters: {selectedCharacters.length}</p>

      <h3 style={{color: '#34495e', marginBottom: '5px'}}>Overall Party Stats:</h3>
      <p style={{marginLeft: '10px'}}>Average Attack: <strong>{averageAttack}</strong></p>
      <p style={{marginLeft: '10px', marginBottom: '20px'}}>Average Defense: <strong>{averageDefense}</strong></p>

      <h3 style={{color: '#34495e', marginBottom: '10px'}}>Selected Characters & Cards:</h3>
      {selectedCharacters.map(character => (
        <div key={character.id} style={characterItemStyle}>
          <strong style={{color: '#2980b9', fontSize: '1.1em'}}>{character.name} ({character.class})</strong>
          <ul style={cardListStyle}>
            {character.assignedCards.map(card => (
              <li key={card.id} style={{marginBottom: '3px'}}>
                <span title={card.description}>{card.name}</span>
                <em style={{fontSize: '0.8em', color: '#555'}}> - {card.description}</em>
              </li>
            ))}
            {character.assignedCards.length === 0 && <li style={{fontStyle: 'italic'}}>No cards assigned</li>}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default PartySummary;
