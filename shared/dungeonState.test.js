import { test } from 'node:test'
import assert from 'assert'
import { generateDungeon, getDungeon, moveTo } from './dungeonState.js'

test('generateDungeon initializes grid, rooms and start/end', () => {
  generateDungeon(3, 3)
  const d = getDungeon()
  assert.strictEqual(d.width, 3)
  assert.strictEqual(d.height, 3)
  assert.deepStrictEqual(d.start, { x: 0, y: 0 })
  assert.deepStrictEqual(d.end, { x: 2, y: 2 })
  assert.strictEqual(d.rooms.length, 9)
  assert.ok(Array.isArray(d.grid) && d.grid.length === 3)
  assert.ok(d.grid[0][0].visited)
})

test('moveTo updates current and marks visited', () => {
  generateDungeon(2, 2)
  moveTo(1, 1)
  const d = getDungeon()
  assert.deepStrictEqual(d.current, { x: 1, y: 1 })
  const room = d.rooms.find(r => r.x === 1 && r.y === 1)
  assert.ok(room.visited)
})
