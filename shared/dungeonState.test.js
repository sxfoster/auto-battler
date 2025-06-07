import { test } from 'node:test'
import assert from 'assert'
import { generateDungeon, moveTo, getDungeon } from './dungeonState.js'

function roomAt(x, y) {
  return getDungeon().rooms.find((r) => r.x === x && r.y === y)
}

test('generateDungeon creates grid and path', () => {
  generateDungeon(3, 3)
  const d = getDungeon()
  assert.strictEqual(d.width, 3)
  assert.strictEqual(d.height, 3)
  assert.strictEqual(d.rooms.length, 9)
  assert.deepStrictEqual(d.start, { x: 0, y: 0 })
  assert.deepStrictEqual(d.end, { x: 2, y: 2 })
  const pathCoords = [
    [0, 0],
    [1, 0],
    [2, 0],
    [2, 1],
    [2, 2],
  ]
  for (const [x, y] of pathCoords) {
    assert.notStrictEqual(roomAt(x, y).type, 'empty')
  }
})

test('moveTo marks room visited', () => {
  generateDungeon(2, 2)
  moveTo(1, 0)
  assert.strictEqual(roomAt(1, 0).visited, true)
  assert.deepStrictEqual(getDungeon().current, { x: 1, y: 0 })
})
