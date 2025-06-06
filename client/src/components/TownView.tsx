import React from 'react'
import { Link } from 'react-router-dom'
import { useGameState } from '../GameStateProvider.jsx'
import styles from './TownView.module.css'

export default function TownView() {
  const party = useGameState(s => s.party)

  const members = party?.characters.map(c => c.name).join(', ') || 'No party'

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2>Town Hub</h2>
        <p className={styles.summary}>Party: {members}</p>
        <Link to="/" className={styles.mainMenu}>Return to Main Menu</Link>
      </header>
      <div className={styles.grid}>
        <Link to="/party-setup" className={styles.card} aria-label="Manage party">
          <span className={styles.icon}>⚔️</span>
          <h3>Party</h3>
          <p>Manage your heroes</p>
        </Link>
        <Link to="/inventory" className={styles.card} aria-label="View inventory">
          <span className={styles.icon}>🎒</span>
          <h3>Inventory</h3>
          <p>View your items</p>
        </Link>
        <Link to="/cards" className={styles.card} aria-label="Browse cards">
          <span className={styles.icon}>📜</span>
          <h3>Cards</h3>
          <p>Browse your card collection</p>
        </Link>
        <Link to="/crafting" className={styles.card} aria-label="Craft items">
          <span className={styles.icon}>🛠️</span>
          <h3>Crafting</h3>
          <p>Prepare for battle</p>
        </Link>
        <Link to="/shop" className={styles.card} aria-label="Visit shop">
          <span className={styles.icon}>🛒</span>
          <h3>Shop</h3>
          <p>Browse wares</p>
        </Link>
        <Link
          to="/dungeon"
          className={`${styles.card} ${!party ? styles.disabled : ''}`}
          aria-label="Enter dungeon"
        >
          <span className={styles.icon}>🏰</span>
          <h3>Enter Dungeon</h3>
          <p>Begin an adventure</p>
        </Link>
      </div>
    </div>
  )
}
