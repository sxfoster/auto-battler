import React from 'react'
import PropTypes from 'prop-types'

export default function HPBar({ current, max }) {
  const pct = max ? Math.max(0, (current / max) * 100) : 0
  return (
    <div className="w-full h-2 bg-gray-700 rounded overflow-hidden">
      <div
        className="bg-green-500 h-full transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

HPBar.propTypes = {
  current: PropTypes.number,
  max: PropTypes.number
}
