import React from 'react'
import { Link } from 'react-router-dom'
import InventoryScreen from './InventoryScreen.tsx'
import styles from './TownFeaturePage.module.css'

export default function InventoryPage() {
  return (
    <div className={styles.container}>
      <Link to="/town" className={styles.back}>Back to Town</Link>
      <InventoryScreen />
    </div>
  )
}
