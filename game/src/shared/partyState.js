export const partyState = {
  members: [],
  formation: 'default',
}

export function loadPartyState() {
  const raw = localStorage.getItem('partyState')
  if (!raw) return
  try {
    const data = JSON.parse(raw)

    let members = []
    if (Array.isArray(data)) {
      members = data.map((c) => ({ class: String(c), cards: [] }))
    } else if (Array.isArray(data.members)) {
      members = data.members.map((m) =>
        typeof m === 'string'
          ? { class: m, cards: [] }
          : { class: m.class, cards: Array.isArray(m.cards) ? m.cards : [] },
      )
    } else if (Array.isArray(data.characters)) {
      members = data.characters.map((m) =>
        typeof m === 'string'
          ? { class: m, cards: [] }
          : { class: m.class || m.id || '', cards: Array.isArray(m.cards) ? m.cards : [] },
      )
    }
    if (members.length > 0) {
      partyState.members = members
    }

    partyState.formation = data.formation || 'default'
  } catch (e) {
    console.error('Failed to parse party state', e)
  }
}

export function savePartyState() {
  localStorage.setItem('partyState', JSON.stringify(partyState))
}
