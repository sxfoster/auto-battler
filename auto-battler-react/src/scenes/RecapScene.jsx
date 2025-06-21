import React from 'react'
import { useGameStore } from '../store.js'
import ChampionDisplay from '../components/ChampionDisplay.jsx'

export default function RecapScene() {
  const { playerTeam, startSecondChampionDraft } = useGameStore(state => ({
    playerTeam: state.playerTeam,
    startSecondChampionDraft: state.startSecondChampionDraft
  }))

  const championData = {
    hero: playerTeam.hero1,
    ability: playerTeam.ability1,
    weapon: playerTeam.weapon1,
    armor: playerTeam.armor1
  }

  return (
    <div className="scene flex flex-col items-center gap-6">
      <h2 className="text-2xl font-cinzel">Champion Recap</h2>
      <ChampionDisplay championData={championData} championNum={1} />
      <button className="confirm-button mt-4" onClick={startSecondChampionDraft}>
        Continue to Next Draft
      </button>
    </div>
  )
}
