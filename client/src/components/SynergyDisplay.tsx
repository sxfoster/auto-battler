import React from 'react'
import type { ActiveSynergy } from '../game/SynergyManager'
import styles from './SynergyDisplay.module.css'

interface Props {
  synergies: ActiveSynergy[]
}

const SynergyDisplay: React.FC<Props> = ({ synergies }) => {
  if (synergies.length === 0) return null
  return (
    <div className={styles.container} aria-live="polite" aria-atomic="true">
      <h3 className={styles.heading}>Synergies</h3>
      <ul className={styles.list}>
        {synergies.map((s, i) => (
          <li key={i} className={styles.item}>
            <strong>{s.trait}</strong>: {s.bonus.description}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SynergyDisplay
