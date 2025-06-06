import { roomEvents as defaultEvents } from '../models/events.js'

/**
 * Assign random events to rooms in a dungeon map.
 * @param {import('../models').DungeonMap} map
 * @param {import('../models').DungeonEvent[]} [eventPool]
 * @param {number} [chance]
 */
export function assignRandomEventsToRooms(map, eventPool = defaultEvents, chance = 0.2) {
  Object.values(map.rooms).forEach((room) => {
    if (room.id === map.startRoomId) {
      room.event = null
      return
    }
    if (Math.random() < chance) {
      const ev = eventPool[Math.floor(Math.random() * eventPool.length)]
      room.event = JSON.parse(JSON.stringify(ev))
    } else {
      room.event = null
    }
  })
}

/**
 * Trigger the event assigned to a room and apply effects to the game state.
 * @param {import('../models').Room} room
 * @param {import('../models').GameState} state
 * @returns {import('../models').DungeonEvent | null}
 */
export function triggerRoomEvent(room, state) {
  if (!room.event) return null
  const event = room.event
  switch (event.effectType) {
    case 'heal': {
      const hp = event.effectDetails?.hp || 0
      const fatigue = event.effectDetails?.fatigue || 0
      if (state.playerStatus) {
        state.playerStatus.fatigue = Math.max(0, state.playerStatus.fatigue - fatigue)
      }
      // no hp tracking in core state, so just ignore hp
      break
    }
    case 'damage': {
      const value = event.effectDetails?.hp || event.effectDetails?.value || 0
      if (state.playerStatus) {
        state.playerStatus.fatigue += value
      }
      break
    }
    case 'ambush': {
      room.type = 'enemy'
      break
    }
    default:
      break
  }
  room.event = null
  return event
}
