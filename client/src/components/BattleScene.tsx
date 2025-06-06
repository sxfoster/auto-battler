import React, { useEffect, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import styles from './BattleScene.module.css'

interface Unit {
  id: string
  name: string
  hp: number
  maxHp: number
}

const enemyData: Unit[] = [
  { id: 'goblin', name: 'Goblin', hp: 15, maxHp: 15 },
  { id: 'orc', name: 'Orc', hp: 20, maxHp: 20 },
]

export default function BattleScene() {
  const party = useGameStore(state => state.party)
  const [players, setPlayers] = useState<Unit[]>([])
  const [enemies, setEnemies] = useState<Unit[]>(enemyData)
  const [turn, setTurn] = useState<'player' | 'enemy'>('player')
  const [log, setLog] = useState<string[]>([])

  useEffect(() => {
    if (party) {
      const chars = party.characters.map(c => ({
        id: c.id,
        name: c.name,
        hp: c.stats.hp,
        maxHp: c.stats.hp,
      }))
      setPlayers(chars)
    }
  }, [party])

  const attack = (targetId: string) => {
    if (turn !== 'player') return
    setEnemies(prev =>
      prev.map(e =>
        e.id === targetId ? { ...e, hp: Math.max(0, e.hp - 5) } : e,
      ),
    )
    setLog(l => [...l, `Party attacks ${targetId}`])
    setTurn('enemy')
  }

  useEffect(() => {
    if (turn === 'enemy') {
      const enemy = enemies.find(e => e.hp > 0)
      const target = players.find(p => p.hp > 0)
      if (enemy && target) {
        const dmg = 3
        setTimeout(() => {
          setPlayers(p =>
            p.map(pl =>
              pl.id === target.id
                ? { ...pl, hp: Math.max(0, pl.hp - dmg) }
                : pl,
            ),
          )
          setLog(l => [...l, `${enemy.name} attacks ${target.name}`])
          setTurn('player')
        }, 500)
      }
    }
  }, [turn, enemies, players])

  const battleOver =
    players.every(p => p.hp <= 0) || enemies.every(e => e.hp <= 0)

  const resultText = players.every(p => p.hp <= 0) ? 'Defeat' : 'Victory'

  return (
    <div className={styles.container}>
      <h2>Battle</h2>
      <div className={styles.grid}>
        <div className={styles.side}>
          {players.map(p => (
            <div key={p.id} className={styles.unit} aria-label={`${p.name} HP ${p.hp}`}> 
              <strong>{p.name}</strong>
              <div>
                {p.hp} / {p.maxHp}
              </div>
            </div>
          ))}
        </div>
        <div className={styles.side}>
          {enemies.map(e => (
            <div
              key={e.id}
              className={styles.unit}
              onClick={() => attack(e.id)}
              aria-label={`${e.name} HP ${e.hp}`}
              style={{ cursor: turn === 'player' && !battleOver ? 'pointer' : 'default' }}
            >
              <strong>{e.name}</strong>
              <div>
                {e.hp} / {e.maxHp}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.controls}>
        {battleOver ? <p>{resultText}</p> : <p>{turn === 'player' ? 'Select an enemy to attack' : 'Enemy thinking...'}</p>}
      </div>
      <div className={styles.log} aria-live="polite">
        {log.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
    </div>
  )
}
