// shared/dungeonState.js

// Simple dungeon state stored in localStorage and kept in-memory
let dungeon = null;

function generateDungeon(size = 5) {
  const rooms = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      rooms.push({ x, y, visited: false });
    }
  }
  return {
    width: size,
    height: size,
    rooms,
    current: { x: 0, y: 0 },
  };
}

function load() {
  try {
    const raw = localStorage.getItem('dungeonState');
    if (raw) {
      dungeon = JSON.parse(raw);
      return;
    }
  } catch (e) {
    // ignore parse errors and regenerate
  }
  dungeon = generateDungeon();
  dungeon.rooms[0].visited = true;
  save();
}

function save() {
  localStorage.setItem('dungeonState', JSON.stringify(dungeon));
}

export function getDungeon() {
  if (!dungeon) load();
  return dungeon;
}

export function moveTo(x, y) {
  if (!dungeon) load();
  if (x < 0 || y < 0 || x >= dungeon.width || y >= dungeon.height) return;
  dungeon.current = { x, y };
  const room = dungeon.rooms.find((r) => r.x === x && r.y === y);
  if (room) room.visited = true;
  save();
}

export function resetDungeon(size = 5) {
  dungeon = generateDungeon(size);
  dungeon.rooms[0].visited = true;
  save();
}
