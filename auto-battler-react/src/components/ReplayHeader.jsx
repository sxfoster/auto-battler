import React from 'react'
import PropTypes from 'prop-types'

export default function ReplayHeader({ meta }) {
  if (!meta) return null
  const date = meta.date ? new Date(meta.date) : null
  return (
    <div className="mb-4 text-center">
      <h2 className="text-2xl font-cinzel">Replay #{meta.battleId}</h2>
      {date && (
        <p className="text-sm text-gray-400">{date.toLocaleString()}</p>
      )}
      {meta.result && (
        <p className="font-bold mt-1">
          {meta.result}
        </p>
      )}
    </div>
  )
}

ReplayHeader.propTypes = {
  meta: PropTypes.object
}
