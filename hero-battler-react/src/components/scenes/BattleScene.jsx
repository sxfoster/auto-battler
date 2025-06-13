import React, { useEffect, useState } from 'react'
import CompactCard from '../ui/CompactCard'

export default function BattleScene({ team }) {
  const [battleState, setBattleState] = useState([])

  useEffect(() => {
    // initialize enemy team simple placeholder
    const enemies = team.map((t, idx) => ({ ...t, id: 'e'+idx, hp: t.hp }))
    setBattleState([...team, ...enemies])
  }, [team])

  return (
    <div className="battle-scene">
      {battleState.map((c) => (
        <CompactCard key={c.id} combatant={c} />
      ))}
    </div>
  )
}
