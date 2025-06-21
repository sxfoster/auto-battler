import React from 'react'
import { useGameStore } from './store.js'
import AnimatedBackground from './components/AnimatedBackground.jsx'
import DebugMenu from './components/DebugMenu.jsx'

import PackScene from './scenes/PackScene.jsx'
import RevealScene from './scenes/RevealScene.jsx'
import DraftScene from './scenes/DraftScene.jsx'
import BattleScene from './scenes/BattleScene.jsx'
import RecapScene from './scenes/RecapScene.jsx'
import UpgradeScene from './scenes/UpgradeScene.jsx'
import TournamentEndScene from './scenes/TournamentEndScene.jsx'

import './style.css'

export default function App() {
  const gamePhase = useGameStore(state => state.gamePhase)
  let scene = null
  switch (gamePhase) {
    case 'PACK':
      scene = <PackScene />
      break
    case 'REVEAL':
      scene = <RevealScene />
      break
    case 'DRAFT':
      scene = <DraftScene />
      break
    case 'BATTLE':
      scene = <BattleScene />
      break
    case 'RECAP_1':
      scene = <RecapScene />
      break
    case 'RECAP_2':
      scene = <RecapScene />
      break
    case 'UPGRADE':
      scene = <UpgradeScene />
      break
    case 'TOURNAMENT_END':
      scene = <TournamentEndScene />
      break
    default:
      scene = null
  }

  return (
    <>
      <AnimatedBackground isSpeedActive={false} />
      {scene}
      {import.meta.env.DEV && <DebugMenu />}
    </>
  )
}
