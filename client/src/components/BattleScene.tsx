import React, { useEffect, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import styles from './BattleScene.module.css'
import UnitCard from './UnitCard'

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
            <UnitCard key={p.id} unit={p} actionLabel="Stats" onAction={() => console.log('View', p.name)} />
          ))}
        </div>
        <div className={styles.side}>
          {enemies.map(e => (
            <UnitCard
              key={e.id}
              unit={e}
              actionLabel="Attack"
              onAction={() => turn === 'player' && !battleOver && attack(e.id)}
            />
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
