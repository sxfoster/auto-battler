// shared/dungeonState.js

export let dungeon = {
  width: 5,
  height: 5,
  rooms: [], // array of { x, y, type, visited }
  start: { x: 0, y: 0 },
  end: { x: 4, y: 4 },
  current: { x: 0, y: 0 },
}

function findRoom(x, y) {
  return dungeon.rooms.find((r) => r.x === x && r.y === y)
}

export function generateDungeon(w = 5, h = 5) {
  dungeon = {
    width: w,
    height: h,
    rooms: [],
    start: { x: 0, y: 0 },
    end: { x: w - 1, y: h - 1 },
    current: { x: 0, y: 0 },
  }

  // fill grid
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      dungeon.rooms.push({ x, y, type: 'empty', visited: false })
    }
  }

  // carve an L-shaped path from start to end
  for (let x = 0; x < w; x++) {
    const room = findRoom(x, 0)
    if (room) room.type = 'path'
  }
  for (let y = 0; y < h; y++) {
    const room = findRoom(w - 1, y)
    if (room) room.type = 'path'
  }

  const startRoom = findRoom(0, 0)
  if (startRoom) {
    startRoom.type = 'start'
    startRoom.visited = true
  }
  const endRoom = findRoom(w - 1, h - 1)
  if (endRoom) endRoom.type = 'end'
}

export function moveTo(x, y) {
  dungeon.current = { x, y }
  const room = findRoom(x, y)
  if (room) room.visited = true
}

export function getDungeon() {
  return dungeon
}
