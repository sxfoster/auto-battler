import type { Room } from './Room'

export interface DungeonMap {
  /** Rooms indexed by id */
  rooms: Record<string, Room>
  /** Starting room id */
  startRoomId: string
}
