export type TileType = 'wall' | 'floor' | 'start' | 'end';

export interface Dungeon {
  width: number;
  height: number;
  tiles: TileType[][];
  start: { x: number; y: number };
  end: { x: number; y: number };
}

// Simple random walk dungeon generator ensuring a path from start to end
export function generateDungeon(width = 20, height = 15): Dungeon {
  const tiles: TileType[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => 'wall' as TileType),
  );
  const start = { x: 1, y: 1 };
  const end = { x: width - 2, y: height - 2 };
  let x = start.x;
  let y = start.y;
  tiles[y][x] = 'start';

  while (x !== end.x || y !== end.y) {
    const dirs: Array<{ x: number; y: number }> = [];
    if (x < end.x) dirs.push({ x: 1, y: 0 });
    if (x > end.x) dirs.push({ x: -1, y: 0 });
    if (y < end.y) dirs.push({ x: 0, y: 1 });
    if (y > end.y) dirs.push({ x: 0, y: -1 });
    const step = dirs[Math.floor(Math.random() * dirs.length)];
    x += step.x;
    y += step.y;
    tiles[y][x] = 'floor';
  }
  tiles[end.y][end.x] = 'end';

  // Carve some additional random floors to make it interesting
  for (let i = 0; i < width * height * 0.2; i++) {
    const rx = 1 + Math.floor(Math.random() * (width - 2));
    const ry = 1 + Math.floor(Math.random() * (height - 2));
    tiles[ry][rx] = 'floor';
  }

  return { width, height, tiles, start, end };
}
