import React, { useState } from 'react'
import MainMenu from './components/MainMenu.jsx'
import TownHub from './components/TownHub.tsx'
import DungeonPage from './components/DungeonPage.tsx'
import PartySetup from './components/PartySetup.tsx'
import type { UnitState } from './components/ClassDraft'

export default function App() {
  type Screen = 'menu' | 'town' | 'dungeon' | 'party-setup'
  const [activeScreen, setActiveScreen] = useState<Screen>('menu')
  const [activeExpeditionParty, setActiveExpeditionParty] = useState<UnitState[]>([])

  const navigateToPartySetup = () => setActiveScreen('party-setup')
  const handlePartySaved = (finalParty: UnitState[]) => {
    setActiveExpeditionParty(finalParty)
    setActiveScreen('town')
  }

  switch (activeScreen) {
    case 'town':
      return <TownHub onEnterDungeon={navigateToPartySetup} />
    case 'dungeon':
      return <DungeonPage />
    case 'party-setup':
      return <PartySetup onPartySaved={handlePartySaved} />
    default:
      return <MainMenu />
  }
}
