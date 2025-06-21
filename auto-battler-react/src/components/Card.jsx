import React, { forwardRef } from 'react'
import { showStatusTooltip, hideStatusTooltip } from '../statusTooltip.js'

const STATUS_MAP = {
  Stun: { icon: 'fas fa-star', aura: 'aura-stun', description: 'Skips the next action.' },
  Poison: { icon: 'fas fa-skull-crossbones', aura: 'aura-poison', description: 'Takes 2 damage per turn.' },
  Bleed: { icon: 'fas fa-droplet', aura: 'aura-bleed', description: 'Takes damage each turn.' },
  Burn: { icon: 'fas fa-fire-alt', aura: 'aura-burn', description: 'Suffers fire damage each turn.' },
  Slow: { icon: 'fas fa-hourglass-half', aura: 'aura-slow', description: 'Speed reduced.' },
  Confuse: { icon: 'fas fa-question', aura: 'aura-confuse', description: 'May miss actions.' },
  Root: { icon: 'fas fa-tree', aura: 'aura-root', description: 'Cannot act next turn.' },
  Shock: { icon: 'fas fa-bolt', aura: 'aura-shock', description: 'Chance to fail actions.' },
  Vulnerable: { icon: 'fas fa-crosshairs', aura: 'aura-vulnerable', description: 'Takes extra damage.' },
  'Defense Down': { icon: 'fas fa-shield-slash', aura: 'aura-defense-down', description: 'Defense reduced.' },
  'Attack Up': { icon: 'fas fa-arrow-up', aura: 'aura-buff', description: 'Attack increased.' },
  Fortify: { icon: 'fas fa-arrow-up', aura: 'aura-buff', description: 'Defense increased.' }
}

function getRarityClass(rarity = 'common') {
  return rarity.toLowerCase().replace(/\s+/g, '-')
}

const Card = forwardRef(function Card({
  item,
  view = 'detail',
  onClick,
  isDefeated = false,
  isActive = false,
  isTakingDamage = false,
  isAttacking = false,
}, ref) {
  const rarityClass = getRarityClass(item?.rarity)
  const handleClick = () => {
    if (onClick) onClick(item)
  }

  if (view === 'compact') {
    const art = item.art || item.heroData?.art
    const name = item.name || item.heroData?.name
    const currentHp = item.currentHp ?? item.heroData?.currentHp
    const maxHp = item.maxHp ?? item.heroData?.maxHp
    const currentEnergy = item.currentEnergy ?? item.heroData?.currentEnergy
    const hpPercent = maxHp ? (currentHp / maxHp) * 100 : 100
    const hpColor = hpPercent > 50 ? '#48bb78' : hpPercent > 20 ? '#f59e0b' : '#ef4444'

    const auraClasses = item.statusEffects?.map(s => STATUS_MAP[s.name]?.aura).filter(Boolean) || []
    const charged = item.abilityData && item.currentEnergy >= item.abilityData.energyCost
    const hasAura = auraClasses.length > 0 || charged
    const auraStr = auraClasses.join(' ')

    return (
      <div
        ref={ref}
        className={`compact-card ${rarityClass} ${hasAura ? 'has-aura' : ''} ${auraStr} ${charged ? 'is-charged' : ''} ${isDefeated ? 'is-defeated' : ''} ${isActive ? 'is-active-turn' : ''} ${isTakingDamage ? 'is-taking-damage' : ''} ${isAttacking ? 'is-attacking' : ''}`}
        onClick={onClick ? handleClick : undefined}
      >
        <div className="shockwave" />
        <div className="compact-art" style={{ backgroundImage: `url('${art}')` }} />
        <div className="compact-info">
          <div className="compact-name font-cinzel">{name}</div>
          <div className="hp-text">{currentHp} / {maxHp}</div>
          <div className="compact-hp-bar-container">
            <div className="compact-hp-bar-damage" style={{ width: `${hpPercent}%` }} />
            <div className="compact-hp-bar" style={{ width: `${hpPercent}%`, backgroundColor: hpColor }} />
          </div>
          <div className="compact-energy-container">
            <i className="fas fa-bolt" />
            <span className="compact-energy-value">{currentEnergy}</span>
          </div>
        </div>
        <div className="status-icon-container">
          {item.statusEffects?.map((effect) => {
            const info = STATUS_MAP[effect.name] || {}
            return (
              <div
                key={effect.id || effect.name}
                className="status-icon"
                onMouseEnter={(e) =>
                  showStatusTooltip({
                    name: effect.name,
                    turnsRemaining: effect.turnsRemaining,
                    description: info.description
                  }, e.clientX, e.clientY)
                }
                onMouseLeave={hideStatusTooltip}
              >
                <i className={info.icon || 'fas fa-circle'} />
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  let stats = []
  let description = null

  switch (item.type) {
    case 'hero':
      stats = [
        { label: 'HP', value: item.hp },
        { label: 'Attack', value: item.attack },
      ]
      description = item.abilities?.length
        ? item.abilities.map((ab) => (
            <li key={ab.name} className="ability-item">
              {ab.name}
              <div className="tooltip">{ab.effect}</div>
            </li>
          ))
        : <p className="item-description">Class: {item.class}</p>
      break
    case 'ability':
      stats = [
        { label: 'ENERGY', value: item.energyCost },
        { label: 'TYPE', value: item.category?.toUpperCase() },
      ]
      description = (
        <div className="item-ability">
          <p className="ability-description">{item.effect}</p>
        </div>
      )
      break
    case 'weapon':
      if (item.statBonuses) {
        stats = Object.entries(item.statBonuses).map(([stat, value]) => ({
          label: stat,
          value: `${value > 0 ? '+' : ''}${value}`,
        }))
      }
      if (item.ability) {
        description = (
          <div className="item-ability">
            <span className="ability-name">{item.ability.name}</span>
            <p className="ability-description">{item.ability.description}</p>
          </div>
        )
      }
      break
    case 'armor':
      if (item.statBonuses) {
        stats = Object.entries(item.statBonuses).map(([stat, value]) => ({
          label: stat,
          value: `${value > 0 ? '+' : ''}${value}`,
        }))
      }
      description = (
        <div className="item-ability">
          <span className="armor-type-label">{item.armorType} Armor</span>
          {item.ability && (
            <>
              <span className="ability-name">{item.ability.name}</span>
              <p className="ability-description">{item.ability.description}</p>
            </>
          )}
        </div>
      )
      break
    default:
      description = <p className="item-description">An unknown item.</p>
  }

  return (
    <div className="hero-card-container" onClick={onClick ? handleClick : undefined}>
      <div className={`hero-card ${rarityClass}`}>
        {item.rarity === 'Epic' && <div className="shimmer-effect" />}
        <div className="card-frame-base" />
        <div className="card-frame-inlay" />
        <div className="card-rarity-glow" />
        <div className="hero-art-container">
          <div className="hero-art" style={{ backgroundImage: `url('${item.art}')` }} />
        </div>
        <div className="hero-title-plate">
          <h3 className="hero-name font-cinzel">{item.name}</h3>
        </div>
        <div className="hero-stats">
          {stats.map((s) => (
            <div key={s.label} className="stat-block">
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
        <ul className="hero-abilities">{description}</ul>
      </div>
    </div>
  )
})

export default Card
