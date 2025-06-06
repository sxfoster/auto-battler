import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameState } from '../GameStateProvider.jsx'
import InventoryScreen from './InventoryScreen.tsx'
import CardCollection from './CardCollection.tsx'
import MagicalPouch from './MagicalPouch.tsx'
import MarketScreen from './MarketScreen.tsx'
import styles from './TownView.module.css'

export default function TownView() {
  const navigate = useNavigate()
  const updateGameState = useGameState(s => s.updateGameState)
  const save = useGameState(s => s.save)

  const [tab, setTab] = useState<'inventory' | 'cards' | 'craft' | 'market'>('inventory')

  const handleReturn = () => {
    updateGameState({ location: 'dungeon' })
    save()
    navigate('/dungeon')
  }

  const renderContent = () => {
    switch (tab) {
      case 'inventory':
        return <InventoryScreen />
      case 'cards':
        return <CardCollection />
      case 'craft':
        return <MagicalPouch player={{ id: 'p1', name: 'Hero' }} profession={{ id: 'p', name: 'Crafter', description: '' }} />
      case 'market':
        return <MarketScreen marketType="Town" playerId="p1" />
      default:
        return null
    }
  }

  return (
    <div className={styles.container}>
      <h2>Town Hub</h2>
      <nav className={styles.nav} aria-label="Town navigation">
        <button
          onClick={() => setTab('inventory')}
          aria-selected={tab === 'inventory'}
          title="View your items"
        >
          Inventory
        </button>
        <button
          onClick={() => setTab('cards')}
          aria-selected={tab === 'cards'}
          title="Browse your card collection"
        >
          Cards
        </button>
        <button
          onClick={() => setTab('craft')}
          aria-selected={tab === 'craft'}
          title="Open crafting interface"
        >
          Crafting
        </button>
        <button
          onClick={() => setTab('market')}
          aria-selected={tab === 'market'}
          title="Trade items at the market"
        >
          Market
        </button>
        <button onClick={handleReturn} style={{ marginLeft: 'auto' }} title="Return to the dungeon">
          Return
        </button>
      </nav>
      <div className={styles.content}>{renderContent()}</div>
    </div>
  )
}
