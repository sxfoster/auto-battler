import React from 'react'
import PropTypes from 'prop-types'

export default function TimelineControls({
  isPlaying,
  onPlay,
  onPause,
  onPrev,
  onNext,
  current,
  total
}) {
  return (
    <div className="flex items-center justify-center gap-4 mt-4">
      <button onClick={onPrev} aria-label="Previous Turn">◀</button>
      <button
        onClick={isPlaying ? onPause : onPlay}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <button onClick={onNext} aria-label="Next Turn">▶</button>
      <span className="text-sm">Turn {current} of {total}</span>
    </div>
  )
}

TimelineControls.propTypes = {
  isPlaying: PropTypes.bool,
  onPlay: PropTypes.func,
  onPause: PropTypes.func,
  onPrev: PropTypes.func,
  onNext: PropTypes.func,
  current: PropTypes.number,
  total: PropTypes.number
}
