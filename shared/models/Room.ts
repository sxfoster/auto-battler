export type RoomType =
  | 'empty'
  | 'enemy'
  | 'treasure'
  | 'trap'
  | 'rest'
  | 'boss'
  | 'exit'

export interface Room {
  /** Unique room identifier */
  id: string
  /** X coordinate used for map layout */
  x: number
  /** Y coordinate used for map layout */
  y: number
  /** Type of the room */
  type: RoomType
  /** Adjacent room ids */
  connections: string[]
}
