import React, { useEffect, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import UnitCard from './UnitCard'
import styles from './BattleScene.module.css'
import { loadPartyState } from '../utils/partyStorage'
import { classes as allClasses } from '../../../shared/models/classes.js'
import defaultPortrait from '../../../shared/images/default-portrait.png'

interface Unit {
  id: string
  name: string
  hp: number
  maxHp: number
  portrait?: string
  status?: string
}

const enemyData: Unit[] = [
  { id: 'goblin', name: 'Goblin', hp: 15, maxHp: 15, portrait: defaultPortrait },
  { id: 'orc', name: 'Orc', hp: 20, maxHp: 20, portrait: defaultPortrait },
]

export default function BattleScene() {
  const party = useGameStore(state => state.party)
  const [players, setPlayers] = useState<Unit[]>([])
  const [enemies, setEnemies] = useState<Unit[]>(enemyData)
  const [turn, setTurn] = useState<'player' | 'enemy'>('player')
  const [log, setLog] = useState<string[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    if (party) {
      const chars = party.characters.map(c => ({
        id: c.id,
        name: c.name,
        hp: c.stats.hp,
        maxHp: c.stats.hp,
        portrait: c.portrait || defaultPortrait,
      }))
      setPlayers(chars)
      const firstAlive = chars.find(c => c.hp > 0)
      if (firstAlive) setActiveId(firstAlive.id)
    } else {
      const saved = loadPartyState()
      if (saved) {
        const chars = saved.members.map((m, i) => {
          const cls = allClasses.find(c => c.id === m.class)
          const name = cls ? cls.name : m.class
          const id = `${m.class}-${i}`
          return {
            id,
            name,
            hp: 30,
            maxHp: 30,
            portrait: cls?.portrait || defaultPortrait,
          }
        })
        setPlayers(chars)
        if (chars.length) setActiveId(chars[0].id)
      }
    }
  }, [party])

  const attack = (targetId: string) => {
    if (turn !== 'player') return
    const attacker = players.find(p => p.hp > 0)
    if (attacker) setActiveId(attacker.id)
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
        setActiveId(enemy.id)
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

  useEffect(() => {
    if (turn === 'player') {
      const active = players.find(p => p.hp > 0)
      setActiveId(active ? active.id : null)
    }
  }, [turn, players])

  useEffect(() => {
    if (turn === 'player') {
      const attacker = players.find(p => p.hp > 0)
      const target = enemies.find(e => e.hp > 0)
      if (attacker && target) {
        attack(target.id)
      }
    }
  }, [turn, players, enemies])

  const battleOver =
    players.every(p => p.hp <= 0) || enemies.every(e => e.hp <= 0)

  const resultText = players.every(p => p.hp <= 0) ? 'Defeat' : 'Victory'

  return (
    <div className={styles.container}>
      <h2>Battle</h2>
      <div className={styles.teams}>
        <div className={styles.team}>
          <h3>Allies</h3>
          {players.map(p => (
            <UnitCard
              key={p.id}
              id={p.id}
              name={p.name}
              portrait={p.portrait}
              hp={p.hp}
              maxHp={p.maxHp}
              status={p.hp <= 0 ? 'KO' : p.status}
              isActive={activeId === p.id}
              isDisabled={p.hp <= 0}
              actions={[{ label: 'Info', onClick: () => setLog(l => [...l, `${p.name} details`]) }]}
            />
          ))}
        </div>
        <div className={styles.team}>
          <h3>Enemies</h3>
          {enemies.map(e => (
            <UnitCard
              key={e.id}
              id={e.id}
              name={e.name}
              portrait={e.portrait}
              hp={e.hp}
              maxHp={e.maxHp}
              status={e.hp <= 0 ? 'KO' : e.status}
              isActive={activeId === e.id}
              isDisabled={turn !== 'player' || battleOver || e.hp <= 0}
              onSelect={() => attack(e.id)}
              actions={
                turn === 'player' && !battleOver && e.hp > 0
                  ? [{ label: 'Attack', onClick: () => attack(e.id) }]
                  : []
              }
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
