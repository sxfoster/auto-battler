import { test } from 'node:test'
import assert from 'assert'
import { assignRandomEventsToRooms, triggerRoomEvent } from './roomEvents.js'

const sampleEvent = {
  id: 'test-heal',
  name: 'Heal',
  description: '',
  effectType: 'heal',
  effectDetails: { fatigue: 2 },
  duration: 'room',
}

test('assignRandomEventsToRooms assigns events', () => {
  const map = {
    startRoomId: '0',
    rooms: {
      '0': { id: '0', x: 0, y: 0, type: 'empty', connections: [] },
      '1': { id: '1', x: 1, y: 0, type: 'empty', connections: [] },
    },
  }
  assignRandomEventsToRooms(map, [sampleEvent], 1)
  assert.ok(map.rooms['1'].event)
  assert.strictEqual(map.rooms['0'].event, null)
})

test('triggerRoomEvent applies effect and clears', () => {
  const room = { id: '1', x: 0, y: 0, type: 'empty', connections: [], event: sampleEvent }
  const state = { playerStatus: { fatigue: 5 } }
  const ev = triggerRoomEvent(room, state)
  assert.strictEqual(ev.id, 'test-heal')
  assert.strictEqual(state.playerStatus.fatigue, 3)
  assert.strictEqual(room.event, null)
})
