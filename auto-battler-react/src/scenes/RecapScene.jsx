import React from 'react'
import { useGameStore } from '../store.js'
import ChampionDisplay from '../components/ChampionDisplay.jsx'

export default function RecapScene() {
  const { playerTeam, draftStage, startSecondChampionDraft, startBattle } =
    useGameStore(state => ({
      playerTeam: state.playerTeam,
      draftStage: state.draftStage,
      startSecondChampionDraft: state.startSecondChampionDraft,
      startBattle: state.startBattle
    }))

  const isFirst = draftStage === 'CHAMPION_1_COMPLETE'
  const champNum = isFirst ? 1 : 2

  const championData = {
    hero: playerTeam[`hero${champNum}`],
    ability: playerTeam[`ability${champNum}`],
    weapon: playerTeam[`weapon${champNum}`],
    armor: playerTeam[`armor${champNum}`]
  }

  const handleContinue = isFirst ? startSecondChampionDraft : startBattle
  const buttonText = isFirst ? 'Continue to Next Draft' : 'Start Battle'

  return (
    <div className="scene flex flex-col items-center gap-6">
      <h2 className="text-2xl font-cinzel">Champion Recap</h2>
      <ChampionDisplay championData={championData} championNum={champNum} />
      <button className="confirm-button mt-4" onClick={handleContinue}>
        {buttonText}
      </button>
    </div>
  )
}
