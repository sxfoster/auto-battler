import React, { useState } from 'react';
import { UnitState } from '../../shared/models/UnitState';
import ClassDraft from './ClassDraft';
import DeckBuilder from './DeckBuilder';
import PartySummary from './PartySummary';

export interface PartySetupProps {
  onPartySaved: (finalParty: UnitState[]) => void;
}

type Step = 'DRAFTING' | 'DECK_BUILDING' | 'SUMMARY';

const PartySetup: React.FC<PartySetupProps> = ({ onPartySaved }) => {
  const [step, setStep] = useState<Step>('DRAFTING');
  const [draftedParty, setDraftedParty] = useState<UnitState[]>([]);
  const [deckIndex, setDeckIndex] = useState(0);

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
    return <ClassDraft onComplete={handleDraftComplete} />;
  }

  if (step === 'DECK_BUILDING') {
    const unit = draftedParty[deckIndex];
    return <DeckBuilder unit={unit} onComplete={handleDeckBuilt} />;
  }

  return <PartySummary party={draftedParty} onConfirm={handlePartySave} />;
};

export default PartySetup;
