// shared/dungeonState.js

let dungeon = null

export function generateDungeon(width = 5, height = 5) {
  const rooms = []
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      rooms.push({ x, y, visited: false })
    }
  }
  dungeon = {
    width,
    height,
    rooms,
    current: { x: 0, y: 0 },
  }
  dungeon.rooms[0].visited = true
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
  }
}
