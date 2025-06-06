import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useGameState } from '../GameStateProvider.jsx'
import styles from './TownView.module.css'

export default function TownView() {
  const navigate = useNavigate()
  const party = useGameState(s => s.party)

  const members = party?.characters?.map(c => c.name).join(', ') || 'No party'

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2>Town Hub</h2>
        <p className={styles.summary}>Party: {members}</p>
        <Link to="/" className={styles.mainMenu}>Return to Main Menu</Link>
      </header>
      <div className={styles.grid}>
        <button
          className={styles.card}
          onClick={() => navigate('/party-setup')}
          aria-label="Manage Party"
        >
          <span className={styles.icon}>⚔️</span>
          <span className={styles.title}>Party</span>
          <span className={styles.subtitle}>Manage your heroes</span>
        </button>
        <button
          className={styles.card}
          onClick={() => navigate('/inventory')}
          aria-label="View Inventory"
        >
          <span className={styles.icon}>🎒</span>
          <span className={styles.title}>Inventory</span>
          <span className={styles.subtitle}>View your items</span>
        </button>
        <button
          className={styles.card}
          onClick={() => navigate('/cards')}
          aria-label="Browse Cards"
        >
          <span className={styles.icon}>📜</span>
          <span className={styles.title}>Cards</span>
          <span className={styles.subtitle}>Browse your card collection</span>
        </button>
        <button
          className={styles.card}
          onClick={() => navigate('/crafting')}
          aria-label="Craft Items"
        >
          <span className={styles.icon}>🛠️</span>
          <span className={styles.title}>Crafting</span>
          <span className={styles.subtitle}>Prepare for battle</span>
        </button>
        <button
          className={styles.card}
          onClick={() => navigate('/shop')}
          aria-label="Visit Shop"
        >
          <span className={styles.icon}>🛒</span>
          <span className={styles.title}>Shop</span>
          <span className={styles.subtitle}>Browse wares</span>
        </button>
        <button
          className={`${styles.card} ${!party ? styles.disabled : ''}`}
          onClick={() => party && navigate('/dungeon')}
          aria-label="Enter Dungeon"
        >
          <span className={styles.icon}>🏰</span>
          <span className={styles.title}>Enter Dungeon</span>
          <span className={styles.subtitle}>Begin an adventure</span>
        </button>
      </div>
    </div>
  )
}
