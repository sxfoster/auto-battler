export type TileType = 'wall' | 'floor'

export interface DungeonData {
  width: number
  height: number
  tiles: TileType[][]
  start: { x: number; y: number }
  end: { x: number; y: number }
}

/**
 * Simple depth-first maze generation producing a grid based dungeon.
 * Ensures a path exists between the start and end positions.
 */
export function generateDungeon(width = 21, height = 21): DungeonData {
  // odd dimensions work best for this algorithm
  if (width % 2 === 0) width += 1
  if (height % 2 === 0) height += 1

  const tiles: TileType[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => 'wall'),
  )

  const start = { x: 1, y: 1 }
  const stack = [start]
  tiles[start.y][start.x] = 'floor'

  while (stack.length > 0) {
    const { x, y } = stack[stack.length - 1]
    const neighbors = [
      { x: x + 2, y, between: { x: x + 1, y } },
      { x: x - 2, y, between: { x: x - 1, y } },
      { x, y: y + 2, between: { x, y: y + 1 } },
      { x, y: y - 2, between: { x, y: y - 1 } },
    ].filter(
      (n) =>
        n.x > 0 &&
        n.x < width - 1 &&
        n.y > 0 &&
        n.y < height - 1 &&
        tiles[n.y][n.x] === 'wall',
    )

    if (neighbors.length > 0) {
      const next = neighbors[Math.floor(Math.random() * neighbors.length)]
      tiles[next.between.y][next.between.x] = 'floor'
      tiles[next.y][next.x] = 'floor'
      stack.push({ x: next.x, y: next.y })
    } else {
      stack.pop()
    }
  }

  const end = { x: width - 2, y: height - 2 }
  tiles[end.y][end.x] = 'floor'

  return { width, height, tiles, start, end }
}
