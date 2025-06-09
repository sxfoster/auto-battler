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

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => setCurrentStep(i => Math.max(0, i - 1))} disabled={currentStep === 0}>
          Previous
        </button>
        <button onClick={() => setCurrentStep(i => Math.min(steps.length - 1, i + 1))} disabled={currentStep === steps.length - 1}>
          Next
        </button>
        <button onClick={() => setIsPlaying(p => !p)}>{isPlaying ? 'Pause' : 'Play'}</button>
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
      {step && (
        <div style={{ marginTop: '1rem' }}>
          <strong style={{ color: '#58a' }}>{step.actionType}</strong>
          <pre>{step.logMessage}</pre>
        </div>
      )}
    </div>
  )
}
