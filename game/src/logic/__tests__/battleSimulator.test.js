import { simulateBattle } from '../battleSimulator.js'

describe('simulateBattle()', () => {
  it('produces a valid event sequence and ends with battle-end', () => {
    const party = [{ id:'p1', name:'P', stats:{hp:5,mana:1}, deck:[{id:'c1',cost:1, effect:{type:'damage', magnitude:5}}] }]
    const enemy = [{ id:'e1', name:'E', stats:{hp:5,mana:1}, deck:[{id:'d1',cost:1, effect:{type:'damage', magnitude:5}}] }]
    const events = simulateBattle(party, enemy)
    expect(events.length).toBeGreaterThan(0)
    const last = events[events.length-1]
    expect(last.type).toBe('battle-end')
    expect(['victory','defeat','draw']).toContain(last.result)
  })
})
