import React from 'react'
import { Link } from 'react-router-dom'
import MarketScreen from './MarketScreen.tsx'
import styles from './TownFeaturePage.module.css'

export default function ShopPage() {
  return (
    <div className={styles.container}>
      <Link to="/town" className={styles.back}>Back to Town</Link>
      <MarketScreen marketType="Town" playerId="p1" />
    </div>
  )
}
