import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import HPBar from './HPBar.jsx'

export default function CombatantPanel({ combatant, prev }) {
  const [damage, setDamage] = useState(null)

  useEffect(() => {
    if (!prev) return
    const diff = prev.currentHp - combatant.currentHp
    if (diff > 0) {
      setDamage(diff)
      const t = setTimeout(() => setDamage(null), 800)
      return () => clearTimeout(t)
    }
  }, [combatant.currentHp, prev])

  return (
    <div className="relative flex flex-col items-center w-28">
      <img
        src={combatant.art}
        alt={combatant.name}
        className="w-24 h-32 object-cover rounded"
      />
      <div className="mt-1 text-sm">{combatant.name}</div>
      <HPBar current={combatant.currentHp} max={combatant.maxHp} />
      {damage && (
        <span className="absolute -top-2 text-red-400 font-bold damage-float">
          -{damage} HP
        </span>
      )}
    </div>
  )
}

CombatantPanel.propTypes = {
  combatant: PropTypes.object.isRequired,
  prev: PropTypes.object
}
