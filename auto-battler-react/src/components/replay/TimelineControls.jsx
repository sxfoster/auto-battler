import React from 'react'

export default function TimelineControls({ isPlaying, onPlayPause, onNext, onPrev, currentTurn, totalTurns }) {
  return (
    <div className="timeline-controls flex items-center justify-center gap-2 mt-4">
      <button onClick={onPrev} aria-label="Previous Turn" className="px-2 py-1 bg-gray-700 rounded">Prev</button>
      <button onClick={onPlayPause} aria-label="Play or Pause" className="px-3 py-1 bg-gray-700 rounded">
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <button onClick={onNext} aria-label="Next Turn" className="px-2 py-1 bg-gray-700 rounded">Next</button>
      <span className="ml-2 text-sm">Turn {currentTurn} of {totalTurns}</span>
    </div>
  )
}
