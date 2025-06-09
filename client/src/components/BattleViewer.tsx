import React, { useState, useEffect } from 'react'
import type { BattleStep } from 'shared/models/BattleStep'

interface Props {
  steps: BattleStep[]
  currentStep?: number
}

export default function BattleViewer({ steps, currentStep = 0 }: Props) {
  const [index, setIndex] = useState(currentStep)
  const [auto, setAuto] = useState(false)

  useEffect(() => {
    if (!auto) return
    const id = setInterval(() => {
      setIndex(i => (i < steps.length - 1 ? i + 1 : i))
    }, 1000)
    return () => clearInterval(id)
  }, [auto, steps.length])

  const step = steps[index]
  const state = step ? step.postState : []
  const allies = state.filter(u => u.team === 'party')
  const foes = state.filter(u => u.team === 'enemy')

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => setIndex(i => Math.max(0, i - 1))} disabled={index === 0}>
          Previous
        </button>
        <button onClick={() => setIndex(i => Math.min(steps.length - 1, i + 1))} disabled={index === steps.length - 1}>
          Next
        </button>
        <button onClick={() => setAuto(a => !a)}>{auto ? 'Pause' : 'Auto-Play'}</button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <div>
          <h3>Party</h3>
          {allies.map(u => (
            <div key={u.id}>{u.name || u.id}: {u.hp} HP</div>
          ))}
        </div>
        <div>
          <h3>Enemies</h3>
          {foes.map(u => (
            <div key={u.id}>{u.name || u.id}: {u.hp} HP</div>
          ))}
        </div>
      </div>
      {step && (
        <div style={{ marginTop: '1rem' }}>
          <strong>Action:</strong> {step.actionType}
          <pre>{step.logMessage}</pre>
        </div>
      )}
    </div>
  )
}
