import React, { useState, useMemo } from 'react';
import { UnitState } from '@shared/models/UnitState';
import { MOCK_HEROES } from '@shared/mock-data';
import { getRandomizedArchetypeDraft } from '../utils/heroUtils';
import ClassDraft from './ClassDraft';
import DeckBuilder from './DeckBuilder';
import PartySummary from './PartySummary';

export interface PartySetupProps {
  onPartySaved: (finalParty: UnitState[]) => void;
  onCancelSetup: () => void;
}

type Step = 'DRAFTING' | 'DECK_BUILDING' | 'SUMMARY';

const PartySetup: React.FC<PartySetupProps> = ({ onPartySaved, onCancelSetup }) => {
  const [step, setStep] = useState<Step>('DRAFTING');
  const [draftedParty, setDraftedParty] = useState<UnitState[]>([]);
  const [deckIndex, setDeckIndex] = useState(0);

  const draftableHeroes = useMemo(() => {
    return getRandomizedArchetypeDraft(Object.values(MOCK_HEROES));
  }, []);

  // Handler for backward navigation between steps
  const handleBack = () => {
    switch (step) {
      case 'SUMMARY':
        setStep('DECK_BUILDING');
        setDeckIndex(draftedParty.length - 1);
        break;
      case 'DECK_BUILDING':
        if (deckIndex > 0) {
          setDeckIndex(deckIndex - 1);
        } else {
          setStep('DRAFTING');
        }
        break;
      case 'DRAFTING':
      default:
        onCancelSetup();
        break;
    }
  };

  const handleDraftComplete = (party: UnitState[]) => {
    setDraftedParty(party);
    if (party.length > 0) {
      setStep('DECK_BUILDING');
    } else {
      setStep('SUMMARY');
    }
  };

  const handleDeckBuilt = (unit: UnitState) => {
    setDraftedParty(prev => prev.map((u, i) => (i === deckIndex ? unit : u)));
    if (deckIndex < draftedParty.length - 1) {
      setDeckIndex(i => i + 1);
    } else {
      setStep('SUMMARY');
    }
  };

  const handlePartySave = () => {
    onPartySaved(draftedParty);
  };

  if (step === 'DRAFTING') {
    return (
      <ClassDraft
        availableHeroes={draftableHeroes}
        onComplete={handleDraftComplete}
        onBack={handleBack}
      />
    );
  }

  if (step === 'DECK_BUILDING') {
    const unit = draftedParty[deckIndex];
    return (
      <DeckBuilder unit={unit} onComplete={handleDeckBuilt} onBack={handleBack} />
    );
  }

  return (
    <PartySummary
      party={draftedParty}
      onConfirm={handlePartySave}
      onBack={handleBack}
    />
  );
};

export default PartySetup;
