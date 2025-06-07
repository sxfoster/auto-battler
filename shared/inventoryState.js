// shared/inventoryState.js

// In-memory cache
export let inventory = []

// Load from localStorage (call on app start)
export function loadInventory() {
  try {
    const saved = localStorage.getItem('playerInventory')
    inventory = saved ? JSON.parse(saved) : []
  } catch (e) {
    inventory = []
  }
}

// Persist to localStorage
export function saveInventory() {
  localStorage.setItem('playerInventory', JSON.stringify(inventory))
}

// Add a card (avoid duplicates if desired)
export function addCardToInventory(card) {
  inventory.push(card)
  saveInventory()
}

// Optionally remove a card
export function removeCardFromInventory(cardId) {
  inventory = inventory.filter((c) => c.id !== cardId)
  saveInventory()
}

// Export for consumption
export function getInventory() {
  return inventory
}

