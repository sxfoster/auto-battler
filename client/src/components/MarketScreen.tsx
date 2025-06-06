import React, { useState } from 'react'
import type { MarketListing } from '../../../shared/models/MarketListing'
import { getAvailableListings } from '../../../shared/systems/market.js'

interface Props {
  marketType: 'Town' | 'Black' | 'Guild' | 'Auction'
  playerId: string
}

export default function MarketScreen({ marketType, playerId }: Props) {
  const [filters, setFilters] = useState({ rarity: 'All', category: 'All' })
  const listings: MarketListing[] = getAvailableListings(marketType, {
    rarity: filters.rarity === 'All' ? undefined : filters.rarity,
    category: filters.category === 'All' ? undefined : filters.category,
  })

  const rarities = Array.from(new Set(listings.map(l => l.item.rarity)))
  const categories = Array.from(new Set(listings.map(l => l.item.category)))

  return (
    <div>
      <h1>{marketType} Market</h1>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <label>
          Rarity:
          <select
            value={filters.rarity}
            onChange={e => setFilters({ ...filters, rarity: e.target.value })}
            title="Filter listings by rarity"
          >
            <option value="All">All</option>
            {rarities.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </label>
        <label>
          Category:
          <select
            value={filters.category}
            onChange={e => setFilters({ ...filters, category: e.target.value })}
            title="Filter listings by category"
          >
            <option value="All">All</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '0.5rem' }}>
        {listings.map(l => (
          <div key={l.item.id} style={{ border: '1px solid #ccc', padding: '0.5rem' }}>
            <strong>{l.item.name}</strong>
            <p style={{ fontSize: '0.8em' }}>{l.item.description}</p>
            <span>Price: {l.price} {l.currencyType}</span>
            <button style={{ marginTop: '0.5rem' }} aria-label={`Buy ${l.item.name}`} title="Purchase item">
              Buy
            </button>
          </div>
        ))}
        {listings.length === 0 && <p>No items available.</p>}
      </div>
    </div>
  )
}
