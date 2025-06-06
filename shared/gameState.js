const DEFAULT_STATE = {
  currentFloor: 1,
  dungeonDifficulty: 1,
  playerStatus: { fatigue: 0, hunger: 0, thirst: 0 },
  inventory: [],
  location: 'town',
}

export function loadGameState() {
  const raw = localStorage.getItem('gameState')
  if (!raw) return { ...DEFAULT_STATE }
  try {
    return { ...DEFAULT_STATE, ...JSON.parse(raw) }
  } catch (e) {
    console.error('Failed to parse game state', e)
    return { ...DEFAULT_STATE }
  }
}

export function saveGameState(state) {
  localStorage.setItem('gameState', JSON.stringify(state))
}

export { DEFAULT_STATE as defaultGameState }
