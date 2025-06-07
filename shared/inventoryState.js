export const inventoryState = {
  cards: [],
};

export function loadInventoryState() {
  const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('inventoryState') : null;
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    if (Array.isArray(data)) {
      inventoryState.cards = data;
    } else if (Array.isArray(data.cards)) {
      inventoryState.cards = data.cards;
    }
  } catch (e) {
    console.error('Failed to parse inventory state', e);
  }
}

export function saveInventoryState() {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem('inventoryState', JSON.stringify(inventoryState));
}

export function getInventory() {
  return inventoryState.cards;
}

export function setInventory(cards) {
  if (Array.isArray(cards)) {
    inventoryState.cards = cards;
    saveInventoryState();
  }
}

export function addToInventory(card) {
  inventoryState.cards.push(card);
  saveInventoryState();
}
