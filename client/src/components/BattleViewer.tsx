import React, { useState, useEffect } from 'react'
import type { BattleStep } from 'shared/models/BattleStep'
import CharacterPanel from './CharacterPanel'

interface Props {
  steps: BattleStep[]
  initialStep?: number
  onReturnToTown: () => void
}

export default function BattleViewer({ steps, initialStep = 0, onReturnToTown }: Props) {
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
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '10px' }}>
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
      <div style={{ display: 'flex', justifyContent: 'space-around', gap: '20px', marginBottom: '1rem' }}>
        <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px', flex: 1 }}>
          <h3>Party</h3>
          {allies.map(u => (
            <CharacterPanel key={u.id} unit={u} />
          ))}
        </div>
        <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px', flex: 1 }}>
          <h3>Enemies</h3>
          {foes.map(u => (
            <CharacterPanel key={u.id} unit={u} />
          ))}
        </div>
      </div>
      <div style={{ marginTop: '1rem', minHeight: '120px', maxHeight: '200px', overflowY: 'auto', border: '1px solid #eee', padding: '10px', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
        <h4>Battle Log</h4>
        {logs.map((s, i) => (
          <div key={i} style={{ fontSize: '0.85rem', marginBottom: '4px', paddingBottom: '4px', borderBottom: '1px dashed #ddd' }}>
            <strong style={{ color: '#58a' }}>{s.actionType}</strong> {s.logMessage}
          </div>
        ))}
      </div>
      {step?.actionType === 'endBattle' && (
        <div style={{
          marginTop: '1rem',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          padding: '15px',
          border: `2px solid ${step.details.result === 'victory' ? 'green' : 'red'}`,
          textAlign: 'center',
          backgroundColor: step.details.result === 'victory' ? 'lightgreen' : 'lightcoral',
          borderRadius: '5px',
          color: step.details.result === 'victory' ? 'darkgreen' : 'darkred'
        }}>
          {step.details.result === 'victory' ? 'Victory!' : 'Defeat'}
        </div>
      )}
      <button
        onClick={onReturnToTown}
        className="mt-8 px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-xl font-bold"
      >
        Return to Town
      </button>
    </div>
  )
}
