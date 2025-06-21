import React from 'react'
import { STATUS_DATA } from '../data/statusEffects.js'

function getAuraClasses(effects = []) {
  const classes = []
  effects.forEach(e => {
    switch (e.name) {
      case 'Stun':
        classes.push('aura-stun')
        break
      case 'Poison':
        classes.push('aura-poison')
        break
      case 'Bleed':
        classes.push('aura-bleed')
        break
      case 'Burn':
        classes.push('aura-burn')
        break
      case 'Slow':
        classes.push('aura-slow')
        break
      case 'Confuse':
        classes.push('aura-confuse')
        break
      case 'Root':
        classes.push('aura-root')
        break
      case 'Shock':
        classes.push('aura-shock')
        break
      case 'Vulnerable':
        classes.push('aura-vulnerable')
        break
      case 'Defense Down':
        classes.push('aura-defense-down')
        break
      case 'Attack Up':
      case 'Fortify':
        classes.push('aura-buff')
        break
      default:
    }
  })
  return classes
}

function getRarityClass(rarity = 'common') {
  return rarity.toLowerCase().replace(/\s+/g, '-')
}

export default function Card({
  item,
  view = 'detail',
  onClick,
  onStatusHover,
  onStatusOut,
  isDefeated = false,
  isActive = false,
  isTakingDamage = false,
}) {
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

    const auraClasses = getAuraClasses(item.statusEffects)
    const hasAura = auraClasses.length > 0

    return (
      <div
        className={`compact-card ${rarityClass} ${isDefeated ? 'is-defeated' : ''} ${isActive ? 'is-active-turn' : ''} ${isTakingDamage ? 'is-taking-damage' : ''} ${hasAura ? 'has-aura' : ''} ${auraClasses.join(' ')}`}
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
            const data = STATUS_DATA[effect.name] || {}
            const Icon = () => (data.icon ? <i className={data.icon} /> : data.label)
            const handleEnter = (e) => {
              if (onStatusHover)
                onStatusHover(e, {
                  name: effect.name,
                  turns: effect.turnsRemaining,
                  description: data.description || effect.description || ''
                })
            }
            const handleLeave = () => {
              if (onStatusOut) onStatusOut()
            }
            return (
              <div
                key={effect.id || effect.name}
                className="status-icon"
                onMouseEnter={handleEnter}
                onMouseLeave={handleLeave}
              >
                <Icon />
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
}
