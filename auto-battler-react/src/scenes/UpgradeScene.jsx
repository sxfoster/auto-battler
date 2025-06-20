import React, { useEffect, useState } from 'react'
import Card from '../components/Card.jsx'
import ChampionDisplay from '../components/ChampionDisplay.jsx'
import { useGameStore } from '../store.js'
import {
  allPossibleWeapons,
  allPossibleArmors,
  allPossibleAbilities,
  allPossibleHeroes
} from '../data/data.js'

function generateBonusPack(team, wins, didPlayerWin = true) {
  let allowed
  if (didPlayerWin) {
    if (wins <= 1) allowed = ['Common']
    else if (wins <= 3) allowed = ['Common', 'Uncommon']
    else if (wins <= 5) allowed = ['Common', 'Uncommon', 'Rare']
    else allowed = ['Common', 'Uncommon', 'Rare', 'Epic']
  } else {
    allowed = ['Common', 'Uncommon']
  }

  const weaponPool = allPossibleWeapons.filter(w => allowed.includes(w.rarity))
  const armorPool = allPossibleArmors.filter(a => allowed.includes(a.rarity))

  const hero1 = allPossibleHeroes.find(h => h.id === team.hero1)
  const hero2 = allPossibleHeroes.find(h => h.id === team.hero2)
  const classes = [hero1?.class, hero2?.class]
  const abilityPool = allPossibleAbilities.filter(
    ab => allowed.includes(ab.rarity) && classes.includes(ab.class)
  )

  const pack = []
  if (weaponPool.length) {
    const i = Math.floor(Math.random() * weaponPool.length)
    pack.push(weaponPool.splice(i, 1)[0])
  }
  if (armorPool.length) {
    const i = Math.floor(Math.random() * armorPool.length)
    pack.push(armorPool.splice(i, 1)[0])
  }
  if (abilityPool.length) {
    const i = Math.floor(Math.random() * abilityPool.length)
    pack.push(abilityPool.splice(i, 1)[0])
  }
  if (didPlayerWin) {
    const general = [...weaponPool, ...armorPool, ...abilityPool].sort(
      () => 0.5 - Math.random()
    )
    while (pack.length < 6 && general.length) pack.push(general.shift())
  }
  return [...pack].sort(() => 0.5 - Math.random())
}

export default function UpgradeScene() {
  const {
    playerTeam,
    tournament,
    inventory,
    dismantleCard,
    advanceGamePhase,
    equipItem
  } = useGameStore(state => ({
    playerTeam: state.playerTeam,
    tournament: state.tournament,
    inventory: state.inventory,
    dismantleCard: state.dismantleCard,
    advanceGamePhase: state.advanceGamePhase,
    equipItem: state.equipItem
  }))

  const [pack, setPack] = useState([])
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState('REVEAL')
  const current = pack[index]

  useEffect(() => {
    setPack(generateBonusPack(playerTeam, tournament.wins, true))
    setIndex(0)
    setPhase('REVEAL')
  }, [playerTeam, tournament.wins])

  const nextCard = () => {
    const newIndex = index + 1
    if (newIndex >= pack.length) {
      advanceGamePhase('BATTLE')
    } else {
      setIndex(newIndex)
      setPhase('REVEAL')
    }
  }

  const handleDismantle = () => {
    if (!current) return
    dismantleCard(current)
    nextCard()
  }

  const handleTake = () => {
    if (!current) return
    setPhase('EQUIP')
  }

  const handleEquip = slotKey => {
    equipItem(slotKey, current.id)
    nextCard()
  }

  if (!current) return null

  if (phase === 'REVEAL') {
    return (
      <div className="scene">
        <Card item={current} view="detail" />
        <p className="mt-2">Shards: {inventory.shards}</p>
        <div className="flex gap-4 mt-4">
          <button onClick={handleDismantle}>Dismantle</button>
          <button onClick={handleTake}>Take</button>
        </div>
      </div>
    )
  }

  // EQUIP phase
  const champions = [1, 2].map(num => ({
    hero: playerTeam[`hero${num}`],
    ability: playerTeam[`ability${num}`],
    weapon: playerTeam[`weapon${num}`],
    armor: playerTeam[`armor${num}`]
  }))

  return (
    <div className="scene">
      <div className="flex flex-col lg:flex-row gap-8 mt-8" id="upgrade-team-roster">
        {champions.map((data, idx) => {
          const hero = allPossibleHeroes.find(h => h.id === data.hero)
          let valid = true
          if (current.type === 'ability' && hero && hero.class !== current.class) {
            valid = false
          }
          return (
            <ChampionDisplay
              key={idx}
              championData={data}
              championNum={idx + 1}
              targetType={current.type}
              valid={valid}
              onSelectSlot={handleEquip}
            />
          )
        })}
      </div>
    </div>
  )
}
