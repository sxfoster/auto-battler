import type { DungeonMap, Room, RoomType } from 'shared/models'

export function generateDungeonMap(size = 5): DungeonMap {
  const rooms: Record<string, Room> = {}
  const types: RoomType[] = [
    'empty',
    'enemy',
    'treasure',
    'trap',
    'rest',
  ]
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      const id = `${x}-${y}`
      const connections: string[] = []
      if (x > 0) connections.push(`${x - 1}-${y}`)
      if (x < size - 1) connections.push(`${x + 1}-${y}`)
      if (y > 0) connections.push(`${x}-${y - 1}`)
      if (y < size - 1) connections.push(`${x}-${y + 1}`)
      let type: RoomType = 'empty'
      if (x === 0 && y === 0) {
        type = 'empty'
      } else if (x === size - 1 && y === size - 1) {
        type = Math.random() < 0.5 ? 'exit' : 'boss'
      } else {
        type = types[Math.floor(Math.random() * types.length)] as RoomType
      }
      rooms[id] = { id, x, y, type, connections }
    }
  }
  return { rooms, startRoomId: '0-0' }
}
