import React from 'react'
import Card from './Card.jsx'
import { allPossibleHeroes, allPossibleAbilities, allPossibleWeapons, allPossibleArmors } from '../data/data.js'

export default function ChampionDisplay({ slotData, championNum, targetType = null, valid = true, onSelectSlot }) {
  const hero = allPossibleHeroes.find(h => h.id === slotData.hero)
  if (!hero) return null
  const ability = allPossibleAbilities.find(a => a.id === slotData.ability)
  const weapon = allPossibleWeapons.find(w => w.id === slotData.weapon)
  const armor = allPossibleArmors.find(a => a.id === slotData.armor)

  const renderSocket = (item, className, slotKey) => {
    const type = slotKey.replace(/\d+$/, '')
    const isTargetable = targetType === type && valid
    const disabled = targetType && !isTargetable
    const handleClick = () => {
      if (isTargetable && onSelectSlot) onSelectSlot(slotKey)
    }
    return (
      <div
        className={`equipment-socket ${className} ${item ? '' : 'empty-socket'} ${isTargetable ? 'targetable' : ''} ${disabled ? 'disabled' : ''}`}
        style={item ? { backgroundImage: `url('${item.art}')` } : undefined}
        onClick={handleClick}
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
