import React, { useEffect, useState } from 'react'
import Card from '../Card.jsx'

export default function CombatantPanel({ combatant, prev }) {
  const [delta, setDelta] = useState(0)
  useEffect(() => {
    if (!prev) return
    const diff = combatant.currentHp - prev.currentHp
    if (diff !== 0) {
      setDelta(diff)
      const t = setTimeout(() => setDelta(0), 800)
      return () => clearTimeout(t)
    }
  }, [combatant.currentHp, prev])

  return (
    <div className="combatant-panel relative">
      <Card item={combatant} view="compact" />
      {delta !== 0 && (
        <span
          className={`combat-text-popup ${delta < 0 ? 'damage' : 'heal'}`}
          style={{ pointerEvents: 'none' }}
        >
          {delta > 0 ? `+${delta}` : `${delta}`}
        </span>
      )}
    </div>
  )
}
