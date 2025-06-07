// shared/resourcesState.js

// In-memory
let gold = 0

export function loadResources() {
  try {
    const saved = localStorage.getItem('playerResources')
    const obj = saved ? JSON.parse(saved) : {}
    gold = obj.gold || 0
  } catch {
    gold = 0
  }
}

export function saveResources() {
  localStorage.setItem('playerResources', JSON.stringify({ gold }))
}

export function getGold() {
  return gold
}

export function addGold(amount) {
  gold = Math.max(0, gold + amount)
  saveResources()
}

export function spendGold(amount) {
  if (gold >= amount) {
    gold -= amount
    saveResources()
    return true
  }
  return false
}
