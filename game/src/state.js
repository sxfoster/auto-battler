export function loadGameState() {
  const raw = localStorage.getItem('gameState')
  if (raw) {
    try {
      return JSON.parse(raw)
    } catch (e) {
      console.error('Failed to parse game state', e)
    }
  }
  return {
    currentFloor: 1,
    dungeonDifficulty: 1,
    playerStatus: { fatigue: 0, hunger: 0, thirst: 0 },
    inventory: [],
    location: 'town',
  }
}

export function saveGameState(state) {
  localStorage.setItem('gameState', JSON.stringify(state))
}
