import { test } from 'node:test'
import assert from 'assert'
import { generateDungeon, getDungeon, nextFloor, markRoomCleared } from './dungeonState.js'

const storageMock = {
  getItem: () => null,
  setItem: () => {},
}

global.localStorage = storageMock

function neighbors(room, rooms) {
  const dirs = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 }
  ]
  const out = []
  for (const d of dirs) {
    const nx = room.x + d.x
    const ny = room.y + d.y
    const r = rooms.find((rr) => rr.x === nx && rr.y === ny)
    if (r && r.type !== 'empty') out.push(r)
  }
  return out
}

test('generated dungeon has a path from start to end', () => {
  generateDungeon(5, 5)
  const { rooms, start, end } = getDungeon()
  const startRoom = rooms.find((r) => r.x === start.x && r.y === start.y)
  const endRoom = rooms.find((r) => r.x === end.x && r.y === end.y)
  const stack = [startRoom]
  const visited = new Set()
  let found = false
  while (stack.length) {
    const current = stack.pop()
    if (current.x === endRoom.x && current.y === endRoom.y) {
      found = true
      break
    }
    const key = current.x + ',' + current.y
    if (visited.has(key)) continue
    visited.add(key)
    for (const n of neighbors(current, rooms)) {
      stack.push(n)
    }
  }
  assert.ok(found, 'end room reachable from start')
})

test('nextFloor increments floor and resets map', () => {
  generateDungeon(5, 5)
  const first = getDungeon()
  const prevRooms = first.rooms
  assert.strictEqual(first.floor, 1)
  nextFloor()
  const second = getDungeon()
  assert.strictEqual(second.floor, 2)
  assert.notStrictEqual(second.rooms, prevRooms)
  assert.deepStrictEqual(second.current, { x: 0, y: 0 })
})

test('markRoomCleared sets combat room to cleared', () => {
  let combatRoom
  for (let i = 0; i < 10 && !combatRoom; i++) {
    generateDungeon(3, 3)
    combatRoom = getDungeon().rooms.find((r) => r.type === 'combat')
  }
  assert.ok(combatRoom, 'combat room exists')
  markRoomCleared(combatRoom.x, combatRoom.y)
  const updated = getDungeon().rooms.find((r) => r.x === combatRoom.x && r.y === combatRoom.y)
  assert.strictEqual(updated.type, 'cleared')
})
