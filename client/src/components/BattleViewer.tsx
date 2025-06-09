import React, { useState, useEffect } from 'react'
import type { BattleStep } from 'shared/models/BattleStep'
import CharacterPanel from './CharacterPanel'

interface Props {
  steps: BattleStep[]
  initialStep?: number
}

export default function BattleViewer({ steps, initialStep = 0 }: Props) {
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (!isPlaying) return
    const id = setInterval(() => {
      setCurrentStep(i => {
        if (i < steps.length - 1) return i + 1
        setIsPlaying(false)
        return i
      })
    }, 1000)
    return () => clearInterval(id)
  }, [isPlaying, steps.length])

  const step = steps[currentStep]
  const state = step ? step.postState : []
  const allies = state.filter(u => u.team === 'party')
  const foes = state.filter(u => u.team === 'enemy')
  const logs = steps.slice(0, currentStep + 1)

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => setCurrentStep(i => Math.max(0, i - 1))} disabled={currentStep === 0}>
          Previous
        </button>
        <button onClick={() => setCurrentStep(i => Math.min(steps.length - 1, i + 1))} disabled={currentStep === steps.length - 1 || steps.length === 0}>
          Next
        </button>
        <button
          onClick={() => {
            setCurrentStep(0);
            setIsPlaying(false);
          }}
          disabled={steps.length === 0 || currentStep === 0}
        >
          Reset
        </button>
        <button
          onClick={() => setIsPlaying(p => !p)}
          disabled={steps.length === 0 || (!isPlaying && currentStep === steps.length - 1)}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <div>
          <h3>Party</h3>
          {allies.map(u => (
            <CharacterPanel key={u.id} unit={u} />
          ))}
        </div>
        <div>
          <h3>Enemies</h3>
          {foes.map(u => (
            <CharacterPanel key={u.id} unit={u} />
          ))}
        </div>
      </div>
      <div style={{ marginTop: '1rem', minHeight: '120px' }}>
        {logs.map((s, i) => (
          <div key={i} style={{ fontSize: '0.85rem' }}>
            <strong style={{ color: '#58a' }}>{s.actionType}</strong> {s.logMessage}
          </div>
        ))}
      </div>
      {step?.actionType === 'endBattle' && (
        <div style={{ marginTop: '1rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
          {step.details.result === 'victory' ? 'Victory!' : 'Defeat'}
        </div>
      )}
    </div>
  )
}
