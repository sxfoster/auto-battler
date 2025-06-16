import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import PackOpeningAnimation from './PackOpeningAnimation.jsx'
import styles from './TownFeaturePage.module.css'

export default function PackOpener() {
  const [showAnim, setShowAnim] = useState(false)

  return (
    <div className={styles.container}>
      <Link to="/town" className={styles.back}>
        Back to Town
      </Link>
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button onClick={() => setShowAnim(true)}>Open Pack</button>
      </div>
      <PackOpeningAnimation
        visible={showAnim}
        onUnlock={() => setShowAnim(false)}
      />
    </div>
  )
}
