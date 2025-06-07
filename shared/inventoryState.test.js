import { test } from 'node:test'
import assert from 'assert'
import {
  loadInventory,
  addCardToInventory,
  removeCardFromInventory,
  getInventory,
} from './inventoryState.js'

function createMockStorage(initial = '[]') {
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

test('loadInventory reads from storage', () => {
  const storage = createMockStorage(JSON.stringify([{ id: 'c1' }]))
  global.localStorage = storage
  loadInventory()
  assert.deepStrictEqual(getInventory(), [{ id: 'c1' }])
})

test('add and remove card updates storage', () => {
  const storage = createMockStorage('[]')
  global.localStorage = storage
  loadInventory()
  addCardToInventory({ id: 'x' })
  assert.deepStrictEqual(getInventory(), [{ id: 'x' }])
  assert.strictEqual(storage.value, JSON.stringify([{ id: 'x' }]))
  removeCardFromInventory('x')
  assert.deepStrictEqual(getInventory(), [])
  assert.strictEqual(storage.value, JSON.stringify([]))
})

