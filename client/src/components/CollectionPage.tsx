import React from 'react'
import { Link } from 'react-router-dom'
import CardCollection from './CardCollection.tsx'
import styles from './TownFeaturePage.module.css'

export default function CollectionPage() {
  return (
    <div className={styles.container}>
      <Link to="/town" className={styles.back}>🏠 Back to Town</Link>
      <CardCollection />
    </div>
  )
}
