import React from 'react';

export default function DetailCard({ card, onSelect }) {
  const rarityClass = card.rarity.toLowerCase().replace(' ', '-');
  const stats = card.type === 'hero'
    ? (
      <div className="hero-stats">
        <div className="stat-block">
          <div className="stat-value">{card.hp}</div>
          <div className="stat-label">HP</div>
        </div>
        <div className="stat-block">
          <div className="stat-value">{card.attack}</div>
          <div className="stat-label">ATK</div>
        </div>
      </div>
    )
    : (
      <div className="hero-stats">
        <div className="stat-block">
          <div className="stat-value">{card.damage}</div>
          <div className="stat-label">DMG</div>
        </div>
      </div>
    );

  return (
    <div className="hero-card-container" onClick={() => onSelect(card)}>
      <div
        className={`hero-card ${rarityClass}`}
        style={{ backgroundImage: `url(${card.art})` }}
      >
        <div className="shimmer-effect" />
        <div className="hero-name font-cinzel">{card.name}</div>
        <div className="hero-art" style={{ backgroundImage: `url(${card.art})` }} />
        {stats}
        <ul className="hero-abilities">
          {card.abilities.map((a, idx) => (
            <li key={idx}>{a.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
