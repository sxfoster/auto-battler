import { test } from 'node:test'
import assert from 'assert'
import {
  loadDungeon,
  generateDungeon,
  getDungeon,
  moveTo,
} from './dungeonState.js'

function createMockStorage(initial = '') {
  let store = initial
  return {
    getItem: () => store,
    setItem: (_k, v) => {
      store = v
    },
    get value() {
      return store
    },
  }
}

test('generateDungeon assigns room types and persists', () => {
  const storage = createMockStorage('')
  global.localStorage = storage
  generateDungeon(2, 1)
  const d = getDungeon()
  assert.strictEqual(d.rooms.length, 2)
  for (const r of d.rooms) {
    assert.ok(['combat', 'shop', 'event'].includes(r.type))
  }
  assert.strictEqual(storage.value, JSON.stringify(d))
})

test('loadDungeon loads from storage', () => {
  const existing = {
    width: 1,
    height: 1,
    rooms: [{ x: 0, y: 0, visited: true, type: 'shop' }],
    current: { x: 0, y: 0 },
  }
  const storage = createMockStorage(JSON.stringify(existing))
  global.localStorage = storage
  loadDungeon()
  assert.deepStrictEqual(getDungeon(), existing)
})

test('moveTo saves updated position', () => {
  const storage = createMockStorage('')
  global.localStorage = storage
  generateDungeon(1, 2)
  moveTo(0, 1)
  const saved = JSON.parse(storage.value)
  assert.strictEqual(saved.current.y, 1)
  assert.strictEqual(saved.rooms[1].visited, true)
})
