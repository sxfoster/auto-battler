import { test } from 'node:test'
import assert from 'assert'
import { loadResources, getGold, spendGold, addGold } from './resourcesState.js'

function mockStorage(initial = '{"gold":0}') {
  let store = initial
  return {
    getItem: () => store,
    setItem: (_k, v) => { store = v },
    get value() { return store }
  }
}

test('loadResources reads from storage', () => {
  const storage = mockStorage('{"gold":7}')
  global.localStorage = storage
  loadResources()
  assert.strictEqual(getGold(), 7)
})

test('spendGold deducts when enough and persists', () => {
  const storage = mockStorage('{"gold":5}')
  global.localStorage = storage
  loadResources()
  const ok = spendGold(3)
  assert.ok(ok)
  assert.strictEqual(getGold(), 2)
  assert.strictEqual(storage.value, '{"gold":2}')
  const fail = spendGold(5)
  assert.ok(!fail)
  assert.strictEqual(getGold(), 2)
})

