import React from 'react'
import type { UnitState } from './ClassDraft'

interface Props {
  party: UnitState[]
  onConfirm: () => void
}

export default function PartySummary({ party, onConfirm }: Props) {
  return (
    <div>
      <h2>Party Summary</h2>
      <ul>
        {party.map(p => (
          <li key={p.id}>
            {p.name} - {p.deck.length} cards
          </li>
        ))}
      </ul>
      <button onClick={onConfirm}>Save Party</button>
    </div>
  )
}
