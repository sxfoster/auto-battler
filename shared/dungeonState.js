// shared/dungeonState.js

let dungeon = null

function reveal(x, y) {
  if (!dungeon) return
  const dirs = [
    [0, 0],
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]
  dirs.forEach(([dx, dy]) => {
    const nx = x + dx
    const ny = y + dy
    const room = dungeon.rooms.find((r) => r.x === nx && r.y === ny)
    if (room) room.revealed = true
  })
}

export function generateDungeon(width = 5, height = 5) {
  const rooms = []
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      rooms.push({ x, y, visited: false, revealed: false })
    }
  }
  dungeon = {
    width,
    height,
    rooms,
    current: { x: 0, y: 0 },
  }
  dungeon.rooms[0].visited = true
  reveal(0, 0)
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
    reveal(x, y)
  }
}
