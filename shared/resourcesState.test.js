import { test } from 'node:test'
import assert from 'assert'
import {
  loadResources,
  getGold,
  addGold,
  spendGold,
} from './resourcesState.js'

function createMockStorage(initial = '{}') {
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

test('loadResources reads from storage', () => {
  const storage = createMockStorage(JSON.stringify({ gold: 5 }))
  global.localStorage = storage
  loadResources()
  assert.strictEqual(getGold(), 5)
})

test('add and spend gold updates storage', () => {
  const storage = createMockStorage('{}')
  global.localStorage = storage
  loadResources()
  addGold(10)
  assert.strictEqual(getGold(), 10)
  assert.strictEqual(storage.value, JSON.stringify({ gold: 10 }))
  const spent = spendGold(7)
  assert.ok(spent)
  assert.strictEqual(getGold(), 3)
  assert.strictEqual(storage.value, JSON.stringify({ gold: 3 }))
  const fail = spendGold(5)
  assert.ok(!fail)
  assert.strictEqual(getGold(), 3)
})
