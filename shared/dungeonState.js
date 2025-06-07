// shared/dungeonState.js

/**
 * Current dungeon data. The grid is stored both as a flat `rooms` array and a
 * two-dimensional `grid` for convenience. Each room tracks its coordinates,
 * a simple `type` string, and whether the player has visited it.
 */
export let dungeon = {
  width: 5,
  height: 5,
  rooms: [],
  grid: [],
  start: { x: 0, y: 0 },
  end: { x: 4, y: 4 },
  current: { x: 0, y: 0 },
}

/**
 * Create a new dungeon layout. A minimal straight path from the start to the
 * end will exist, but the algorithm simply fills every cell for now.
 *
 * @param {number} w - width of the dungeon grid
 * @param {number} h - height of the dungeon grid
 */
export function generateDungeon(w = 5, h = 5) {
  dungeon = {
    width: w,
    height: h,
    rooms: [],
    grid: [],
    start: { x: 0, y: 0 },
    end: { x: w - 1, y: h - 1 },
    current: { x: 0, y: 0 },
  }

  for (let y = 0; y < h; y++) {
    const row = []
    for (let x = 0; x < w; x++) {
      const room = { x, y, type: 'empty', visited: false }
      dungeon.rooms.push(room)
      row.push(room)
    }
    dungeon.grid.push(row)
  }

  // mark the starting room as visited
  dungeon.grid[0][0].visited = true
}

/**
 * Update the current position and mark the destination room as visited.
 *
 * @param {number} x
 * @param {number} y
 */
export function moveTo(x, y) {
  const room = dungeon.rooms.find((r) => r.x === x && r.y === y)
  if (room) {
    dungeon.current = { x, y }
    room.visited = true
  }
}

export function getDungeon() {
  return dungeon
}
