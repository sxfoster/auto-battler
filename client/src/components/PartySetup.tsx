import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { savePartyState, loadPartyState } from '../utils/partyStorage';
import { loadPartyState as loadSharedPartyState } from '../../../game/src/shared/partyState.js';

// Make sure PartyCharacter is exported
export interface PartyCharacter extends Character {
  assignedCards: Card[];
}

const loadSavedCharacters = (): PartyCharacter[] => {
  const saved = loadPartyState();
  if (!saved || saved.members.length === 0) return [];
  return saved.members
    .map(m => {
      const cls = allClasses.find(c => c.id === m.class);
      if (!cls) return null;
      return {
        id: `${cls.id}-${Math.random().toString(36).slice(2)}`,
        name: cls.name,
        class: cls.id,
        portrait: cls.portrait || defaultPortrait,
        description: cls.description || 'No description available.',
        stats: { hp: 30, energy: 3 },
        deck: [],
        survival: { hunger: 0, thirst: 0, fatigue: 0 },
        assignedCards: m.cards
          .map(cid => sampleCards.find(c => c.id === cid))
          .filter(Boolean) as Card[],
      } as PartyCharacter;
    })
    .filter(Boolean) as PartyCharacter[];
};

const PartySetup: React.FC = () => {
  const [selectedCharacters, setSelectedCharacters] = useState<PartyCharacter[]>(() => loadSavedCharacters());
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
  const location = useLocation();
  const setParty = useGameStore(state => state.setParty);
  const updateGameState = useGameStore(state => state.updateGameState);
  const save = useGameStore(state => state.save);
  const availableClasses = useGameStore(state => state.availableClasses);
  const setAvailableClasses = useGameStore(state => state.setAvailableClasses);
  const load = useGameStore(state => state.load);

  // reload from storage whenever this component mounts
  useEffect(() => {
    loadSharedPartyState();
    console.log('PartySetup mounted - party state loaded');
  }, []);

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
    if (selectedCharacters.length === 0) {
      const chars = loadSavedCharacters();
      if (chars.length) setSelectedCharacters(chars);
    }
  }, [selectedCharacters.length]);

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

  useEffect(() => {
    const state = {
      members: selectedCharacters.map(pc => ({
        class: pc.class,
        cards: pc.assignedCards.map(c => c.id),
      })),
    };
    savePartyState(state);
    save();
  }, [selectedCharacters, save]);

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
    if (selectedCharacters.length > 1) {
      const newParty = selectedCharacters.filter(c => c.id !== characterId);
      setSelectedCharacters(newParty);
      rerollAvailableClasses(newParty);
    } else {
      notify('Your party must have at least one member.', 'error');
    }
  };

  const handleCardAssign = (characterId: string, card: Card) => {
    setSelectedCharacters(selectedCharacters.map(pc => {
      if (pc.id === characterId && pc.assignedCards.length < 2 && !pc.assignedCards.find(c => c.id === card.id)) {
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

  const handleSaveParty = () => {
    const state = {
      members: selectedCharacters.map(pc => ({
        class: pc.class,
        cards: pc.assignedCards.map(c => c.id),
      })),
    };
    savePartyState(state);
    notify('Party saved', 'success');
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

  // Party setup no longer launches the dungeon directly. The player
  // configures their party here and then returns to town to begin the
  // adventure from there.

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
          const clsDef = allClasses.find(c => c.id === pc.class);
          if (!clsDef) {
            console.warn(`Unknown class id: ${pc.class}`);
          }
          return (
            <div key={pc.id} className={styles.selectedCharacterPanel}> {/* Apply .selectedCharacterPanel */}
              <div className={styles.characterPanelHeader}> {/* Apply .characterPanelHeader */}
                <h3>{pc.name} (Class: {clsDef ? clsDef.name : 'Unknown'})</h3>
                <button
                  onClick={() => handleClassRemove(pc.id)}
                  disabled={selectedCharacters.length === 1}
                  className={styles.removeButton}
                >
                  Remove Class
                </button>
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
        <button onClick={handleSaveParty} className={styles.saveButton}>
          Save Party
        </button>
        <button onClick={() => navigate('/town')} className={styles.backButton}>
          Back to Town
        </button>
      </div>
      </div>
    </div>
  );
};

export default PartySetup;
