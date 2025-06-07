import { test } from 'node:test'
import assert from 'assert'
import { partyState, loadPartyState } from '../../game/src/shared/partyState.js'

function mockStorage(value) {
  return {
    getItem: () => value,
    setItem: () => {},
  }
}

test('loadPartyState upgrades string array saves', () => {
  global.localStorage = mockStorage(JSON.stringify(['cleric', 'warrior']))
  loadPartyState()
  assert.deepStrictEqual(partyState.members, [
    { class: 'cleric', cards: [] },
    { class: 'warrior', cards: [] },
  ])
})

test('loadPartyState loads card assignments', () => {
  global.localStorage = mockStorage(
    JSON.stringify({ members: [{ class: 'bard', cards: ['inspire'] }] }),
  )
  loadPartyState()
  assert.deepStrictEqual(partyState.members, [
    { class: 'bard', cards: ['inspire'] },
  ])
})
