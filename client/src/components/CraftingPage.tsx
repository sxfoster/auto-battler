import React from 'react'
import { Link } from 'react-router-dom'
import MagicalPouch from './MagicalPouch.tsx'
import styles from './TownFeaturePage.module.css'

export default function CraftingPage() {
  return (
    <div className={styles.container}>
      <Link to="/town" className={styles.back}>Back to Town</Link>
      <MagicalPouch player={{ id: 'p1', name: 'Hero' }} profession={{ id: 'p', name: 'Crafter', description: '' }} />
    </div>
  )
}
