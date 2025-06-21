import React from 'react'
import { useGameStore } from '../store.js'

export default function TournamentEndScene() {
  const { wins, losses } = useGameStore(state => state.tournament)
  const isVictor = wins >= 10

  return (
    <div
      id="tournament-end-screen"
      className="scene flex flex-col items-center justify-center bg-gray-900 bg-opacity-90"
    >
      <h1 id="tournament-end-title" className="text-6xl font-cinzel">
        {isVictor ? 'Tournament Victor!' : 'Your Run Has Ended'}
      </h1>
      <h2 className="text-2xl mt-4">
        Final Record: {wins} Wins - {losses} Losses
      </h2>
      <button
        id="tournament-play-again-button"
        className="confirm-button mt-12"
        onClick={() => window.location.reload()}
      >
        Play Again
      </button>
    </div>
  )
}
