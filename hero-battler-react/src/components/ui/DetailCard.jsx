import React from 'react'
import './DetailCard.css'

export default function DetailCard({ card, onSelect }) {
  const handleClick = () => {
    if (onSelect) onSelect(card)
  }
  return (
    <div className={`detail-card rarity-${card.rarity}`} onClick={handleClick}>
      <div className="card-content">
        <div className="nameplate">{card.name}</div>
        {card.type === 'hero' && (
          <div className="stats">HP: {card.hp} / ATK: {card.attack}</div>
        )}
        {card.type !== 'hero' && (
          <div className="stats">{card.damage ? `DMG: ${card.damage}` : ''}{card.hp ? ` HP: ${card.hp}` : ''}</div>
        )}
      </div>
    </div>
  )
}
