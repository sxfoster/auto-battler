import React, { useState } from 'react'
import { sampleCards } from '../../../shared/models/cards.js'
import CardDisplay from './CardDisplay'
import styles from './CardCollection.module.css'

export default function CardCollection() {
  const [rarity, setRarity] = useState('All')
  const [selected, setSelected] = useState<string[]>([])

  const rarities = Array.from(new Set(sampleCards.map(c => c.rarity)))

  const filtered = sampleCards.filter(c => rarity === 'All' || c.rarity === rarity)

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Card Collection</h1>
      <div className={styles.controls}>
        <label htmlFor="rarity">Rarity:</label>
        <select id="rarity" value={rarity} onChange={e => setRarity(e.target.value)}>
          <option value="All">All</option>
          {rarities.map(r => (<option key={r} value={r}>{r}</option>))}
        </select>
      </div>
      <div className={styles.grid}>
        {filtered.map(card => (
          <div key={card.id} className={styles.cardWrapper}>
            <input
              type="checkbox"
              checked={selected.includes(card.id)}
              onChange={() => toggle(card.id)}
              className={styles.checkbox}
              aria-label={`Select ${card.name}`}
            />
            <CardDisplay
              card={card}
              onSelect={() => toggle(card.id)}
              isSelected={selected.includes(card.id)}
              isDisabled={false}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
