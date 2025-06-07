// shared/resourcesState.js

export let gold = 0

export function loadResources() {
  try {
    const saved = localStorage.getItem('resources')
    if (saved) {
      const data = JSON.parse(saved)
      gold = typeof data.gold === 'number' ? data.gold : 0
    }
  } catch {
    gold = 0
  }
}

export function saveResources() {
  localStorage.setItem('resources', JSON.stringify({ gold }))
}

export function getGold() {
  return gold
}

export function addGold(amount) {
  gold += amount
  saveResources()
}

export function spendGold(amount) {
  if (gold < amount) return false
  gold -= amount
  saveResources()
  return true
}
