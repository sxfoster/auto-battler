// shared/dungeonState.js

let dungeon = null

function randomPath(width, height) {
  const path = [{ x: 0, y: 0 }]
  let x = 0
  let y = 0
  while (x !== width - 1 || y !== height - 1) {
    const options = []
    if (x < width - 1) options.push({ x: x + 1, y })
    if (y < height - 1) options.push({ x, y: y + 1 })
    const next = options[Math.floor(Math.random() * options.length)]
    x = next.x
    y = next.y
    path.push({ x, y })
  }
  return path
}

export function generateDungeon(width = 5, height = 5, floor = 1) {
  const rooms = []
  const path = randomPath(width, height)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const inPath = path.some((p) => p.x === x && p.y === y)
      const idx = path.findIndex((p) => p.x === x && p.y === y)
      let type = 'empty'
      if (idx === 0) {
        type = 'start'
      } else if (idx === path.length - 1) {
        type = 'end'
      } else if (inPath) {
        const roll = Math.random()
        type = roll < 0.1 ? 'shop' : roll < 0.3 ? 'event' : 'combat'
      }
      rooms.push({ x, y, type, visited: idx === 0 })
    }
  }
  dungeon = {
    width,
    height,
    floor,
    rooms,
    start: { x: 0, y: 0 },
    end: { x: width - 1, y: height - 1 },
    current: { x: 0, y: 0 },
  }
  saveDungeon()
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

export function nextFloor() {
  if (!dungeon) return
  const { width, height } = dungeon
  const floor = (dungeon.floor || 1) + 1
  generateDungeon(width, height, floor)
}
