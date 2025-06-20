import React from 'react'

export default function Card({ data, view = 'compact', isActive = false, isTakingDamage = false }) {
  if (view !== 'compact') {
    return null
  }

  const name = data.heroData ? data.heroData.name : data.name
  const art = data.heroData ? data.heroData.art : data.art
  const hp = data.currentHp ?? data.hp
  const maxHp = data.maxHp ?? data.hp
  const energy = data.currentEnergy

  return (
    <div className={`compact-card ${isActive ? 'is-active-turn' : ''} ${isTakingDamage ? 'is-taking-damage' : ''}`.trim()}>
      <div className="compact-art" style={{ backgroundImage: `url(${art})` }} />
      <div className="compact-info">
        <div className="compact-name">{name}</div>
        <div className="hp-text">{hp} / {maxHp}</div>
        <div className="compact-hp-bar-container">
          <div className="compact-hp-bar" style={{ width: `${(hp / maxHp) * 100}%` }} />
          <div className="compact-hp-bar-damage" style={{ width: `${(hp / maxHp) * 100}%` }} />
        </div>
      </div>
      {typeof energy === 'number' && (
        <div className="compact-energy-container">
          <i className="fas fa-bolt" /> {energy}
        </div>
      )}
    </div>
  )
}
