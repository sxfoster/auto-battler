// shared/dungeonState.js

let dungeon = null

function saveDungeon() {
  localStorage.setItem('dungeonData', JSON.stringify(dungeon))
}

export function loadDungeon(width = 5, height = 5) {
  try {
    const saved = localStorage.getItem('dungeonData')
    dungeon = saved ? JSON.parse(saved) : null
  } catch (e) {
    dungeon = null
  }
  if (!dungeon) {
    generateDungeon(width, height)
  }
}

export function generateDungeon(width = 5, height = 5) {
  const rooms = []
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const typeIdx = Math.floor(Math.random() * 3)
      const type = ['combat', 'shop', 'event'][typeIdx]
      rooms.push({ x, y, visited: false, type })
    }
  }
  dungeon = {
    width,
    height,
    rooms,
    current: { x: 0, y: 0 },
  }
  dungeon.rooms[0].visited = true
  saveDungeon()
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
