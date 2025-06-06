import type { Formation } from './Formation'

const KEY = 'preBattleFormation'

export function saveFormation(formation: Formation) {
  localStorage.setItem(KEY, JSON.stringify(formation))
}

export function loadFormation(): Formation | null {
  const raw = localStorage.getItem(KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Formation
  } catch {
    return null
  }
}

export function clearFormation() {
  localStorage.removeItem(KEY)
}
