import React, { useState } from 'react'
import { classes } from '../../../shared/models/classes.js'

export interface UnitState {
  id: string
  name: string
  classId: string
  deck: string[]
}

interface Props {
  onDraftComplete: (party: UnitState[]) => void
}

export default function ClassDraft({ onDraftComplete }: Props) {
  const [selected, setSelected] = useState<string[]>([])

  const toggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(c => c !== id)
        : prev.length < 4
        ? [...prev, id]
        : prev
    )
  }

  const handleNext = () => {
    const party = selected.map(id => {
      const cls = classes.find(c => c.id === id)!
      return { id, name: cls.name, classId: cls.id, deck: [] }
    })
    onDraftComplete(party)
  }

  return (
    <div>
      <h2>Select Your Party</h2>
      <ul>
        {classes.map(cls => (
          <li key={cls.id}>
            <label>
              <input
                type="checkbox"
                checked={selected.includes(cls.id)}
                onChange={() => toggle(cls.id)}
              />
              {cls.name}
            </label>
          </li>
        ))}
      </ul>
      <button disabled={selected.length === 0} onClick={handleNext}>
        Next
      </button>
    </div>
  )
}
