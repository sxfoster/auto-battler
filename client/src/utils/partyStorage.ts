export interface PartyMember {
  class: string
  cards: string[]
}

export interface PartyState {
  members: PartyMember[]
}

const KEY = 'partyState';

export function savePartyState(state: PartyState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save party', e);
  }
}

export function loadPartyState(): PartyState | null {
  const raw = localStorage.getItem(KEY)
  if (!raw) return null
  try {
    const data = JSON.parse(raw)

    // Old format: array of class strings
    if (Array.isArray(data)) {
      return {
        members: data.map((c: any) => ({ class: String(c), cards: [] })),
      }
    }

    let members: PartyMember[] = []
    if (Array.isArray(data.members)) {
      members = data.members.map((m: any) =>
        typeof m === 'string'
          ? { class: m, cards: [] }
          : { class: m.class, cards: Array.isArray(m.cards) ? m.cards : [] },
      )
    } else if (Array.isArray(data.characters)) {
      members = data.characters.map((m: any) =>
        typeof m === 'string'
          ? { class: m, cards: [] }
          : { class: m.class || m.id || '', cards: Array.isArray(m.cards) ? m.cards : [] },
      )
    }

    if (members.length > 0) {
      return { members }
    }

    return data as PartyState
  } catch {
    return null
  }
}
