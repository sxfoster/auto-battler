import React, { useState } from 'react'
import PackScene from './components/scenes/PackScene'
import DraftScene from './components/scenes/DraftScene'
import BattleScene from './components/scenes/BattleScene'
import { allPossibleHeroes, allPossibleWeapons, allPossibleAbilities, allPossibleArmors } from './data/cardData'
import './App.css'

function App() {
  const [gameState, setGameState] = useState('HERO_1_PACK')
  const [team, setTeam] = useState([])
  const [draftOptions, setDraftOptions] = useState([])

  const openPack = () => {
    let pool = []
    if (gameState.includes('HERO')) pool = allPossibleHeroes
    if (gameState.includes('WEAPON')) pool = allPossibleWeapons
    if (gameState.includes('ABILITY')) pool = allPossibleAbilities
    if (gameState.includes('ARMOR')) pool = allPossibleArmors
    const choices = pool.slice(0, 2)
    setDraftOptions(choices)
    setGameState(gameState.replace('PACK', 'DRAFT'))
  }

  const advanceDraft = (selection) => {
    setTeam([...team, selection])
    switch (gameState) {
      case 'HERO_1_DRAFT':
        setGameState('WEAPON_1_PACK')
        break
      case 'WEAPON_1_DRAFT':
        setGameState('ABILITY_1_PACK')
        break
      case 'ABILITY_1_DRAFT':
        setGameState('ARMOR_1_PACK')
        break
      case 'ARMOR_1_DRAFT':
        setGameState('BATTLE')
        break
      default:
        setGameState('BATTLE')
    }
  }

  return (
    <div className="app-container">
      {gameState.includes('PACK') && <PackScene gameState={gameState} onOpen={openPack} />}
      {gameState.includes('DRAFT') && <DraftScene options={draftOptions} onCardSelect={advanceDraft} />}
      {gameState === 'BATTLE' && <BattleScene team={team} />}
    </div>
  )
}

export default App
