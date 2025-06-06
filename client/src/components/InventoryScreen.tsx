import React, { useState } from 'react'
import { useNotification } from './NotificationManager.jsx'
import { sampleCards } from '../../../shared/models/cards.js'
import styles from './InventoryScreen.module.css'

interface InventoryItem {
  id: string
  name: string
  type: string
  rarity: string
  description: string
}

const allItems: InventoryItem[] = sampleCards.map(c => ({
  id: c.id,
  name: c.name,
  type: c.category || c.type || 'Unknown',
  rarity: c.rarity || 'Common',
  description: c.description || ''
}))

export default function InventoryScreen() {
  const [filter, setFilter] = useState('All')
  const { notify } = useNotification()

  const items = allItems.filter(i => filter === 'All' || i.type === filter)

  const uniqueTypes = Array.from(new Set(allItems.map(i => i.type)))

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Inventory</h1>
      <div className={styles.filterRow}>
        <label htmlFor="filter">Filter:</label>
        <select
          id="filter"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className={styles.select}
        >
          <option value="All">All</option>
          {uniqueTypes.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <div className={styles.grid}>
        {items.map(item => (
          <div
            key={item.id}
            className={styles.item}
            tabIndex={0}
            aria-label={`${item.name} ${item.rarity} ${item.type}. ${item.description}`}
          >
            <strong>{item.name}</strong>
            <span className={styles.meta}>{item.rarity}</span>
            <p className={styles.desc}>{item.description}</p>
            <div className={styles.actions}>
              <button onClick={() => notify(`Used ${item.name}`, 'success')}>Use</button>
              <button onClick={() => notify(`Equipped ${item.name}`, 'success')}>Equip</button>
              <button onClick={() => notify(`Sold ${item.name}`, 'success')}>Sell</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
