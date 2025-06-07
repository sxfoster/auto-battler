let inventory = [];

/** Get a copy of the current inventory */
export function getInventory() {
  return [...inventory];
}

/** Set inventory items directly */
export function setInventory(items) {
  inventory = [...items];
}

/** Add a card or item to the inventory */
export function addCardToInventory(card) {
  inventory.push(card);
}

/** Remove an item from inventory by id */
export function removeFromInventory(id) {
  const idx = inventory.findIndex(i => i.id === id);
  if (idx !== -1) inventory.splice(idx, 1);
}

/** Clear the inventory */
export function resetInventory() {
  inventory = [];
}
