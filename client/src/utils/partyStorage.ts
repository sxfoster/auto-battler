export interface PartyState {
  members: { class: string; cards: string[] }[];
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
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PartyState;
  } catch {
    return null;
  }
}
