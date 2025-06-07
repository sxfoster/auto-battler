// shared/dungeonState.js

let dungeon = null

export function generateDungeon(width = 5, height = 5) {
  const rooms = []
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      rooms.push({ x, y })
    }
  }
  dungeon = {
    width,
    height,
    rooms,
    start: { x: 0, y: 0 },
    end: { x: width - 1, y: height - 1 },
    current: { x: 0, y: 0 },
  }
  // After carving a path, assign room types
  dungeon.rooms = dungeon.rooms.map((r, idx) => ({
    ...r,
    type:
      idx === 0
        ? 'start'
        : idx === dungeon.rooms.length - 1
        ? 'end'
        : Math.random() < 0.1
        ? 'shop'
        : Math.random() < 0.2
        ? 'event'
        : 'combat',
    visited: idx === 0,
  }))
}

export function loadDungeon() {
  try {
    const saved = localStorage.getItem('dungeonState')
    if (saved) {
      dungeon = JSON.parse(saved)
    }
  } catch {
    /* ignore */
  }
}

export function getDungeon() {
  return dungeon
}

export function moveTo(x, y) {
  if (!dungeon) return
  const room = dungeon.rooms.find((r) => r.x === x && r.y === y)
  if (room) {
    dungeon.current = { x, y }
    room.visited = true
    saveDungeon()
  }
}

export function saveDungeon() {
  localStorage.setItem('dungeonState', JSON.stringify(dungeon))
}
