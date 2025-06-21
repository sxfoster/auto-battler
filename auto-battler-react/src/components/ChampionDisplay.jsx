import React from 'react'
import Card from './Card.jsx'
import {
  allPossibleHeroes,
  allPossibleAbilities,
  allPossibleWeapons,
  allPossibleArmors
} from '../data/data.js'

export default function ChampionDisplay({
  championData,
  championNum = 1,
  targetType = null,
  valid = true,
  onSelectSlot,
  onHoverSlot
}) {
  const data = championData || {}
  const hero = allPossibleHeroes.find(h => h.id === data.hero)
  if (!hero) return null
  const ability = allPossibleAbilities.find(a => a.id === data.ability)
  const weapon = allPossibleWeapons.find(w => w.id === data.weapon)
  const armor = allPossibleArmors.find(a => a.id === data.armor)

  const renderSocket = (item, className, slotKey) => {
    const type = slotKey.replace(/\d+$/, '')
    const isTargetable = targetType === type && valid
    const disabled = targetType && !isTargetable
    const handleClick = () => {
      if (isTargetable && onSelectSlot) onSelectSlot(slotKey)
    }
    const handleMouseOver = e => {
      if (isTargetable && onHoverSlot) onHoverSlot(e, slotKey)
    }
    const handleMouseOut = () => {
      if (isTargetable && onHoverSlot) onHoverSlot(null)
    }
    return (
      <div
        className={`equipment-socket ${className} ${item ? '' : 'empty-socket'} ${isTargetable ? 'targetable' : ''} ${disabled ? 'disabled' : ''}`}
        data-slot={slotKey}
        data-type={type}
        style={item ? { backgroundImage: `url(${item.art})` } : undefined}
        title={item ? `${item.name} - ${item.rarity}` : undefined}
        onClick={handleClick}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
      >
        {!item && <i className="fas fa-plus" />}
      </div>
    )
  }

  const heroData = { ...hero }
  if (ability) heroData.abilities = [ability]

  return (
    <div className={`champion-display ${!valid ? 'is-invalid' : ''}`}>
      <Card item={heroData} view="detail" />
      {renderSocket(ability, 'ability-socket', `ability${championNum}`)}
      {renderSocket(weapon, 'weapon-socket', `weapon${championNum}`)}
      {renderSocket(armor, 'armor-socket', `armor${championNum}`)}
    </div>
  )
}
