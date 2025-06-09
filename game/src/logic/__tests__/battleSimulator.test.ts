import { simulateBattle } from '../battleSimulator.js'
import type { BattleStep } from '../../../../shared/models/BattleStep'

describe('simulateBattle()', () => {
  it('produces structured steps including damage and death', () => {
    const party = [{ id:'p1', name:'P', stats:{hp:5,mana:1}, deck:[{id:'c1',cost:1, effect:{type:'damage', magnitude:5}}] }]
    const enemy = [{ id:'e1', name:'E', stats:{hp:5,mana:1}, deck:[{id:'d1',cost:1, effect:{type:'damage', magnitude:5}}] }]
    const steps: BattleStep[] = simulateBattle(party, enemy)
    expect(Array.isArray(steps)).toBe(true)
    expect(steps.length).toBeGreaterThan(0)
    const actions = steps.map(s => s.actionType)
    expect(actions).toContain('startTurn')
    expect(actions).toContain('dealDamage')
    expect(actions).toContain('death')
    const last = steps[steps.length - 1]
    expect(last.actionType).toBe('endBattle')
    steps.forEach(step => {
      expect(Array.isArray(step.preState)).toBe(true)
      expect(Array.isArray(step.postState)).toBe(true)
    })
  })
})
