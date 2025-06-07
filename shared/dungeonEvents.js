// shared/dungeonEvents.js
import { getDungeon, saveDungeon } from './dungeonState.js'
import { updatePlayerBalance } from './systems/market.js'

/** Apply an event outcome to the dungeon state and player party. */
export function applyEventOutcome(tag) {
  const { current, rooms } = getDungeon()
  const room = rooms.find((r) => r.x === current.x && r.y === current.y)
  // Example: give 10 gold for accept, nothing for decline
  if (tag === 'accept') updatePlayerBalance('player', 'Gold', 10)
  // mark event as done so revisit won’t retrigger
  room.type = 'combat'
  saveDungeon()
}
