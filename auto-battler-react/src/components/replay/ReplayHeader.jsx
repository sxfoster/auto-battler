import React from 'react'

export default function ReplayHeader({ meta }) {
  if (!meta) return null
  const { battleId, date, playerName, enemyName, result } = meta
  const formatted = date ? new Date(date).toLocaleString() : ''
  const resultClass = result === 'Victory' ? 'text-green-400' : 'text-red-400'
  return (
    <div className="replay-header text-center mb-4">
      <h2 className="text-2xl font-cinzel">Battle #{battleId}</h2>
      <div className="text-sm opacity-80">{formatted}</div>
      <div className="flex items-center justify-center gap-2 mt-2">
        <span className="font-semibold">{playerName}</span>
        <span className="text-gray-400">vs.</span>
        <span className="font-semibold">{enemyName}</span>
        {result && <span className={`ml-4 font-bold ${resultClass}`}>{result}</span>}
      </div>
    </div>
  )
}
