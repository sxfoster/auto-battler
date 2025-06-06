import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
// Import data models. Adjust paths if necessary.
import type { Character } from '../../../shared/models/Character';
import type { Card } from '../../../shared/models/Card';
import type { Party } from '../../../shared/models/Party';

// Mock data for characters and cards - replace with actual data fetching or imports
import { sampleCards } from '../../../shared/models/cards.js';
import { classes as allClasses } from '../../../shared/models/classes.js';
import { getRandomClasses, type GameClass } from '../utils/randomizeClasses';

import ClassCard from './ClassCard';
import CardAssignmentPanel from './CardAssignmentPanel'; // Import
import PartySummary from './PartySummary'; // Import PartySummary
import defaultPortrait from '../../../shared/images/default-portrait.png';
import { useModal } from './ModalManager.jsx';
import { useNotification } from './NotificationManager.jsx';
import styles from './PartySetup.module.css';

// Make sure PartyCharacter is exported
export interface PartyCharacter extends Character {
  assignedCards: Card[];
}

const PartySetup: React.FC = () => {
  const [selectedCharacters, setSelectedCharacters] = useState<PartyCharacter[]>([]);
  const [availableCards, setAvailableCards] = useState<Card[]>([]);
  const [isRerolling, setIsRerolling] = useState(false);
  const [rerollCount, setRerollCount] = useState(0);
  const [undoCount, setUndoCount] = useState(0);
  const [rerollFlash, setRerollFlash] = useState(false);
  const [undoFlash, setUndoFlash] = useState(false);

  const roleColors: Record<string, string> = {
    Tank: '#2980b9',
    Healer: '#27ae60',
    Support: '#9b59b6',
    DPS: '#e74c3c',
  }

  const navigate = useNavigate();
  const setParty = useGameStore(state => state.setParty);
  const updateGameState = useGameStore(state => state.updateGameState);
  const save = useGameStore(state => state.save);
  const availableClasses = useGameStore(state => state.availableClasses);
  const setAvailableClasses = useGameStore(state => state.setAvailableClasses);
  const load = useGameStore(state => state.load);

  // Reset limits when starting a new setup session
  useEffect(() => {
    setRerollCount(0);
    setUndoCount(0);
  }, []);

  // Ensure game state is loaded when arriving via client-side navigation
  useEffect(() => {
    if (availableClasses.length === 0 && selectedCharacters.length === 0) {
      load();
    }
  }, [availableClasses.length, selectedCharacters.length, load]);

  useEffect(() => {
    if (availableClasses.length === 0 && selectedCharacters.length < 5) {
      const remaining = allClasses.filter(c => !selectedCharacters.find(pc => pc.class === c.id));
      setAvailableClasses(getRandomClasses(Math.min(4, remaining.length), remaining));
    }
  }, [availableClasses.length, selectedCharacters, setAvailableClasses, load]);

  useEffect(() => {
    setAvailableCards(
      sampleCards.map(sc => ({
        ...sc,
        description: sc.description || 'No effect description.',
      }))
    );
  }, []);

  useEffect(() => {
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

    setParty(partyData);
  }, [selectedCharacters, setParty]);

  const rerollAvailableClasses = (current: PartyCharacter[]) => {
    const remaining = allClasses.filter(cls => !current.find(pc => pc.class === cls.id));
    if (current.length >= 5) {
      setAvailableClasses([]);
    } else {
      setAvailableClasses(getRandomClasses(Math.min(4, remaining.length), remaining));
    }
  };

  const handleClassSelect = (cls: GameClass) => {
    if (selectedCharacters.length >= 5) return;
    if (selectedCharacters.find(c => c.class === cls.id)) return;
    const character: PartyCharacter = {
      id: `${cls.id}-${Date.now()}-${Math.random()}`,
      name: cls.name,
      class: cls.id,
      portrait: cls.portrait || defaultPortrait,
      description: cls.description || 'No description available.',
      stats: { hp: 30, energy: 3 },
      deck: [],
      survival: { hunger: 0, thirst: 0, fatigue: 0 },
      assignedCards: [],
    };
    const newParty = [...selectedCharacters, character];
    setSelectedCharacters(newParty);
    rerollAvailableClasses(newParty);
  };

  const handleClassRemove = (characterId: string) => {
    const newParty = selectedCharacters.filter(c => c.id !== characterId);
    setSelectedCharacters(newParty);
    rerollAvailableClasses(newParty);
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

  const handleRerollClasses = () => {
    if (rerollCount >= 2) {
      notify('Maximum rerolls reached', 'error');
      setRerollFlash(true);
      setTimeout(() => setRerollFlash(false), 500);
      return;
    }
    if (isRerolling) return;
    setIsRerolling(true);
    const remaining = allClasses.filter(c => !selectedCharacters.find(pc => pc.class === c.id));
    setAvailableClasses(getRandomClasses(Math.min(4, remaining.length), remaining));
    setTimeout(() => setIsRerolling(false), 500);
    setRerollCount(c => {
      const next = c + 1;
      if (next >= 2) {
        setRerollFlash(true);
        setTimeout(() => setRerollFlash(false), 500);
      }
      return next;
    });
  };

  const handleUndoLastPick = () => {
    if (undoCount >= 2) {
      notify('Maximum undos reached', 'error');
      setUndoFlash(true);
      setTimeout(() => setUndoFlash(false), 500);
      return;
    }
    const last = selectedCharacters[selectedCharacters.length - 1];
    if (!last) return;
    handleClassRemove(last.id);
    setUndoCount(c => {
      const next = c + 1;
      if (next >= 2) {
        setUndoFlash(true);
        setTimeout(() => setUndoFlash(false), 500);
      }
      return next;
    });
  };

  const { open, close } = useModal();
  const { notify } = useNotification();

  const handleStartGame = () => {
    const missing = selectedCharacters.find(pc => pc.assignedCards.length < 4)
    if (missing) {
      notify(`${missing.name} needs 4 cards assigned`, 'error')
      return
    }
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

    setParty(partyData);
    updateGameState({ location: 'dungeon', currentFloor: 1 })
    save()

    const id = open(
      <div style={{ textAlign: 'center' }}>
        <p>Entering the Dungeon…</p>
        <button onClick={() => close(id)}>Continue</button>
      </div>
    );

    setTimeout(() => close(id), 1500);
    navigate('/dungeon');
  };

  const isPartyValid =
    selectedCharacters.length > 0 &&
    selectedCharacters.length <= 5 &&
    selectedCharacters.every(pc => pc.assignedCards.length === 4);

  // Basic JSX structure - will be expanded in subsequent steps
  return (
    <div className={styles.screen}>
      <div className={styles.setupCard}>
        <h1 className={styles.title}>Party Setup</h1>
        <div className={styles.classList}>
          {availableClasses.map((cls, index) => (
            <ClassCard
              key={`${cls.id}-${index}`}
              cls={cls}
              onSelect={handleClassSelect}
              disabled={!!selectedCharacters.find(c => c.class === cls.id)}
            />
          ))}
          {availableClasses.length > 0 && (
            <>
              <button
                className={`${styles.rerollButton} ${rerollFlash ? styles.disabledFlash : ''}`}
                onClick={handleRerollClasses}
                disabled={isRerolling || rerollCount >= 2}
                title={rerollCount >= 2 ? 'Maximum rerolls reached' : 'Try a new set of classes for your adventure!'}
              >
                Reroll Classes
              </button>
              <span className={styles.actionCounter}>Rerolls left: {2 - rerollCount}</span>
            </>
          )}
        </div>

      <p style={{ textAlign: 'center', marginTop: '0.5rem' }}>
        Select up to 5 classes: {selectedCharacters.length}/5 chosen
      </p>
      {selectedCharacters.length > 0 && (
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <button
            className={`${styles.rerollButton} ${styles.undoButton} ${undoFlash ? styles.disabledFlash : ''}`}
            onClick={handleUndoLastPick}
            disabled={undoCount >= 2}
            title={undoCount >= 2 ? 'Maximum undos reached' : 'Remove the most recently added class'}
          >
            Undo Last Pick
          </button>
          <span className={styles.actionCounter}>Undos left: {2 - undoCount}</span>
        </div>
      )}

      {/* Selected Characters and Card Assignment Section */}
      <div className={styles.selectedCharactersArea}> {/* Apply .selectedCharactersArea */}
        <h2 className={styles.sectionTitle}>Configure Your Party</h2>
        {selectedCharacters.length === 0 && (
          <p className={styles.infoText}>
            No classes selected yet. Click on a class above to add it to your party.
          </p>
        )}
        {selectedCharacters.map(pc => {
          const clsDef = allClasses.find(c => c.id === pc.class || c.name === pc.class);
          if (!clsDef) {
            console.error(`Unknown class id: ${pc.class}`);
          }
          return (
            <div key={pc.id} className={styles.selectedCharacterPanel}> {/* Apply .selectedCharacterPanel */}
              <div className={styles.characterPanelHeader}> {/* Apply .characterPanelHeader */}
                <h3>{pc.name} (Class: {clsDef ? clsDef.name : 'Unknown'})</h3>
                <button onClick={() => handleClassRemove(pc.id)} className={styles.removeButton}>Remove Class</button>
              </div>
              <CardAssignmentPanel
                character={pc}
                availableCards={availableCards} // Full list of cards from game data
                onAssignCard={handleCardAssign}
                onRemoveCard={handleCardRemove}
              />
            </div>
          );
        })}
      </div>

      {/* Party Summary Section */}
      <PartySummary
        selectedCharacters={selectedCharacters}
        onRemoveCharacter={handleClassRemove}
      />
      {/* PartySummary will have its own internal styling or use passed classNames */}

      <div className={styles.navigationButtons}>
        <button onClick={() => navigate('/')} className={styles.backButton}>
          Back
        </button>
        <button
          onClick={handleStartGame}
          disabled={!isPartyValid}
          className={styles.startGameButton}
        >
          Enter Dungeon
        </button>
      </div>
      </div>
    </div>
  );
};

export default PartySetup;
