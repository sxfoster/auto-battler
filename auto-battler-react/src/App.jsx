import React from 'react'
import { useGameStore } from './store.js'

import PackScene from './scenes/PackScene.jsx'
import RevealScene from './scenes/RevealScene.jsx'
import DraftScene from './scenes/DraftScene.jsx'
import WeaponScene from './scenes/WeaponScene.jsx'
import BattleScene from './scenes/BattleScene.jsx'
import RecapScene from './scenes/RecapScene.jsx'
import UpgradeScene from './scenes/UpgradeScene.jsx'
import TournamentEndScene from './scenes/TournamentEndScene.jsx'

import './style.css'

export default function App() {
  const gamePhase = useGameStore(state => state.gamePhase)

  switch (gamePhase) {
    case 'PACK':
      return <PackScene />
    case 'REVEAL':
      return <RevealScene />
    case 'DRAFT':
      return <DraftScene />
    case 'WEAPON':
      return <WeaponScene />
    case 'BATTLE':
      return <BattleScene />
    case 'RECAP_1':
      return <RecapScene />
    case 'UPGRADE':
      return <UpgradeScene />
    case 'TOURNAMENT_END':
      return <TournamentEndScene />
    default:
      return null
  }
}
