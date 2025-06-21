import React, { useState } from 'react'
import PropTypes from 'prop-types'

function getCategory(type) {
  if (type.includes('damage')) return 'combat'
  if (type.includes('heal')) return 'healing'
  if (type.includes('status')) return 'status'
  if (type.includes('energy')) return 'utility'
  return 'info'
}

function getIconClass(type) {
  const base = type.split(' ')[0]
  switch (base) {
    case 'damage':
    case 'status-damage':
      return 'fa-gavel'
    case 'heal':
      return 'fa-heart'
    case 'energy':
      return 'fa-bolt'
    case 'ability-cast':
    case 'ability-result':
      return 'fa-star'
    case 'status':
      return 'fa-flask-potion'
    case 'round':
      return 'fa-shield-halved'
    case 'victory':
      return 'fa-crown'
    case 'defeat':
      return 'fa-skull'
    default:
      return 'fa-circle-info'
  }
}

function guessType(msg) {
  const m = msg.toLowerCase()
  if (m.includes('wins the battle')) return m.includes('enemy') ? 'defeat' : 'victory'
  if (m.includes('heals')) return 'heal'
  if (m.includes('poison damage')) return 'status-damage'
  if (m.includes('damage')) return 'damage'
  if (m.includes('energy')) return 'energy'
  if (m.includes('uses')) return 'ability-cast'
  if (m.includes('defeated') || m.includes('stunned') || m.includes('afflicted')) return 'status'
  return 'info'
}

export default function BattleLog({ battleLog = [] }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')

  const handleToggle = () => setIsExpanded(exp => !exp)
  const handleFilter = (filter) => setActiveFilter(filter)

  const entries = battleLog.map(e => {
    if (typeof e === 'string') return { message: e, type: guessType(e) }
    return e
  })

  const summary = entries.length ? entries[entries.length - 1].message : 'The battle is about to begin...'

  return (
    <div id="battle-log-container">
      <div id="battle-log-panel" className={isExpanded ? 'expanded' : ''}>
        <div id="battle-log-filters">
          {['all', 'combat', 'healing', 'status', 'utility'].map(f => (
            <button
              key={f}
              className={`filter-btn ${activeFilter === f ? 'active' : ''}`}
              data-filter={f}
              onClick={() => handleFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div id="log-entries-container">
          {entries.slice().reverse().map((entry, idx) => {
            const type = entry.type || 'info'
            const category = getCategory(type)
            const iconClass = getIconClass(type)
            const hidden = activeFilter !== 'all' && category !== activeFilter
            return (
              <div
                key={idx}
                className={`log-entry ${type} ${hidden ? 'hidden-by-filter' : ''}`}
                data-category={category}
              >
                <i className={`log-entry-icon fas ${iconClass}`}></i>
                {entry.message}
              </div>
            )
          })}
        </div>
      </div>
      <div id="battle-log-summary" title="Click to expand log" onClick={handleToggle}>
        <span>{summary}</span>
        <i className="fas fa-chevron-up"></i>
      </div>
    </div>
  )
}

BattleLog.propTypes = {
  battleLog: PropTypes.array,
}
