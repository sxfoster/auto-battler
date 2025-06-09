import React, { useState } from 'react'
import ClassDraft, { UnitState } from './ClassDraft'
import DeckBuilder from './DeckBuilder'
import PartySummary from './PartySummary'

interface Props {
  onPartySaved: (party: UnitState[]) => void
}

type Step = 'draft' | 'deck' | 'summary'

export default function PartySetup({ onPartySaved }: Props) {
  const [step, setStep] = useState<Step>('draft')
  const [party, setParty] = useState<UnitState[]>([])

  const handleDraftComplete = (units: UnitState[]) => {
    setParty(units)
    setStep('deck')
  }

  const handleDeckComplete = (units: UnitState[]) => {
    setParty(units)
    setStep('summary')
  }

  const handleSave = () => {
    onPartySaved(party)
  }

  if (step === 'draft') {
    return <ClassDraft onDraftComplete={handleDraftComplete} />
  }
  if (step === 'deck') {
    return <DeckBuilder party={party} onComplete={handleDeckComplete} />
  }
  return <PartySummary party={party} onConfirm={handleSave} />
}
