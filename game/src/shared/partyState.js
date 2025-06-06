export const partyState = {
  members: [],
  formation: 'default',
}

export function loadPartyState() {
  const raw = localStorage.getItem('partyState')
  if (!raw) return
  try {
    const data = JSON.parse(raw)
    partyState.members = data.members || data.characters || []
    partyState.formation = data.formation || 'default'
  } catch (e) {
    console.error('Failed to parse party state', e)
  }
}

export function savePartyState() {
  localStorage.setItem('partyState', JSON.stringify(partyState))
}
