import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
// Import data models. Adjust paths if necessary.
import type { Character } from '../../../shared/models/Character';
import type { Card } from '../../../shared/models/Card';
import type { Party } from '../../../shared/models/Party';

// Mock data for characters and cards - replace with actual data fetching or imports
import { sampleCharacters } from '../../../shared/models/characters.js';
import { sampleCards } from '../../../shared/models/cards.js';

import CharacterCard from './CharacterCard'; // Import CharacterCard
import CardAssignmentPanel from './CardAssignmentPanel'; // Import
import PartySummary from './PartySummary'; // Import PartySummary
import styles from './PartySetup.module.css';

// Make sure PartyCharacter is exported
export interface PartyCharacter extends Character {
  assignedCards: Card[];
}

const PartySetup: React.FC = () => {
  const [selectedCharacters, setSelectedCharacters] = useState<PartyCharacter[]>([]);
  const [availableCharacters, setAvailableCharacters] = useState<Character[]>([]);
  const [availableCards, setAvailableCards] = useState<Card[]>([]);

  const navigate = useNavigate();
  const setParty = useGameStore(state => state.setParty);

  useEffect(() => {
    // Initialize available characters and cards
    // In a real app, this might involve fetching data from an API
    setAvailableCharacters(sampleCharacters.map(sc => ({
      ...sc,
      // Ensure all fields from the Character interface are present
      portrait: sc.portrait || 'default-portrait.png', // Provide a default if not present
      description: sc.description || 'No description available.', // Default description
      stats: sc.stats || { hp: 0, energy: 0 }, // Default stats
      deck: sc.deck || [], // Default deck
      survival: sc.survival || { hunger: 0, thirst: 0, fatigue: 0 } // Default survival stats
    })));
    setAvailableCards(sampleCards.map(sc => ({
      ...sc,
      // Ensure all fields from the Card interface are present
      description: sc.description || 'No effect description.' // Default description
    })));
  }, []);

  const handleCharacterSelect = (character: Character) => {
    const isSelected = selectedCharacters.find(c => c.id === character.id);
    if (isSelected) {
      // Deselect character
      handleCharacterRemove(character.id);
    } else {
      // Select character if party is not full
      if (selectedCharacters.length < 5) {
        setSelectedCharacters([...selectedCharacters, { ...character, assignedCards: [] }]);
      }
    }
  };

  const handleCharacterRemove = (characterId: string) => {
    setSelectedCharacters(selectedCharacters.filter(c => c.id !== characterId));
  };

  const handleCardAssign = (characterId: string, card: Card) => {
    setSelectedCharacters(selectedCharacters.map(pc => {
      if (pc.id === characterId && pc.assignedCards.length < 4 && !pc.assignedCards.find(c => c.id === card.id)) {
        return { ...pc, assignedCards: [...pc.assignedCards, card] };
      }
      return pc;
    }));
  };

  const handleCardRemove = (characterId: string, cardId: string) => {
    setSelectedCharacters(selectedCharacters.map(pc => {
      if (pc.id === characterId) {
        return { ...pc, assignedCards: pc.assignedCards.filter(c => c.id !== cardId) };
      }
      return pc;
    }));
  };

  const handleStartGame = () => {
    const partyData: Party = {
      characters: selectedCharacters.map(pc => ({
        id: pc.id,
        name: pc.name,
        class: pc.class,
        portrait: pc.portrait,
        description: pc.description,
        stats: pc.stats,
        deck: pc.assignedCards,
        survival: pc.survival,
      })),
    };

    setParty(partyData)
    navigate('/dungeon')
  };

  // Basic JSX structure - will be expanded in subsequent steps
  return (
    <div className={styles.screen}> {/* Apply .screen class */}
      <h1 className={styles.title}>Party Setup</h1> {/* Apply .title class */}

      {/* Character Selection Section */}
      <div className={styles.characterSelectionArea}>
        <h2 className={styles.sectionTitle}>Select Characters (up to 5)</h2>
        <div className={styles.characterSelectionGrid}> {/* Apply .characterSelectionGrid */}
          {availableCharacters.filter(ac => !selectedCharacters.find(sc => sc.id === ac.id)).map(character => (
            <CharacterCard
              key={character.id}
              character={character}
              onSelect={handleCharacterSelect}
              isSelected={false}
              isDisabled={selectedCharacters.length >= 5}
            />
          ))}
        </div>
      </div>

      {/* Selected Characters and Card Assignment Section */}
      <div className={styles.selectedCharactersArea}> {/* Apply .selectedCharactersArea */}
        <h2 className={styles.sectionTitle}>Configure Your Party</h2>
        {selectedCharacters.length === 0 && <p className={styles.infoText}>No characters selected yet. Click on a character above to add them to your party.</p>}
        {selectedCharacters.map(pc => (
          <div key={pc.id} className={styles.selectedCharacterPanel}> {/* Apply .selectedCharacterPanel */}
            <div className={styles.characterPanelHeader}> {/* Apply .characterPanelHeader */}
              <h3>{pc.name} (Class: {pc.class})</h3>
              <button onClick={() => handleCharacterRemove(pc.id)} className={styles.removeButton}>Remove Character</button>
            </div>
            <CardAssignmentPanel
              character={pc}
              availableCards={availableCards} // Full list of cards from game data
              onAssignCard={handleCardAssign}
              onRemoveCard={handleCardRemove}
            />
          </div>
        ))}
      </div>

      {/* Party Summary Section */}
      <PartySummary selectedCharacters={selectedCharacters} /> {/* PartySummary will have its own internal styling or use passed classNames */}

      <button
        onClick={handleStartGame}
        disabled={selectedCharacters.length === 0 || selectedCharacters.some(pc => pc.assignedCards.length !== 4)}
        className={styles.startGameButton} // Apply .startGameButton
      >
        Start Game
      </button>
    </div>
  );
};

export default PartySetup;
