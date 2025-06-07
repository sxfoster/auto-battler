export const inventoryState = {
  items: []
}

/**
 * Load inventory data from localStorage into inventoryState.
 */
export function loadInventory() {
  const raw = localStorage.getItem('inventoryState')
  if (!raw) return
  try {
    const data = JSON.parse(raw)
    if (Array.isArray(data)) {
      inventoryState.items = data
    } else if (Array.isArray(data.items)) {
      inventoryState.items = data.items
    }
  } catch (e) {
    console.error('Failed to load inventory', e)
  }
}

/**
 * Persist current inventoryState to localStorage.
 */
export function saveInventory() {
  try {
    localStorage.setItem('inventoryState', JSON.stringify(inventoryState))
  } catch (e) {
    console.error('Failed to save inventory', e)
  }
}
