import type { BattleStep } from 'shared/models/BattleStep'

export const sampleSteps: BattleStep[] = [
  {
    actorId: 'p1',
    actionType: 'startTurn',
    details: {},
    targets: [],
    preState: [
      { id: 'p1', name: 'Hero', hp: 10, energy: 1, buffs: {}, team: 'party' },
      { id: 'e1', name: 'Goblin', hp: 6, energy: 0, buffs: {}, team: 'enemy' }
    ],
    postState: [
      { id: 'p1', name: 'Hero', hp: 10, energy: 2, buffs: {}, team: 'party' },
      { id: 'e1', name: 'Goblin', hp: 6, energy: 0, buffs: {}, team: 'enemy' }
    ],
    logMessage: 'Hero readies for battle'
  },
  {
    actorId: 'p1',
    actionType: 'playCard',
    details: { cardId: 'Strike', cost: 1 },
    targets: ['e1'],
    preState: [
      { id: 'p1', name: 'Hero', hp: 10, energy: 2, buffs: {}, team: 'party' },
      { id: 'e1', name: 'Goblin', hp: 6, energy: 0, buffs: {}, team: 'enemy' }
    ],
    postState: [
      { id: 'p1', name: 'Hero', hp: 10, energy: 1, buffs: {}, team: 'party' },
      { id: 'e1', name: 'Goblin', hp: 6, energy: 0, buffs: {}, team: 'enemy' }
    ],
    logMessage: 'Hero uses Strike'
  },
  {
    actorId: 'p1',
    actionType: 'dealDamage',
    details: { amount: 6 },
    targets: ['e1'],
    preState: [
      { id: 'p1', name: 'Hero', hp: 10, energy: 1, buffs: {}, team: 'party' },
      { id: 'e1', name: 'Goblin', hp: 6, energy: 0, buffs: {}, team: 'enemy' }
    ],
    postState: [
      { id: 'p1', name: 'Hero', hp: 10, energy: 1, buffs: {}, team: 'party' },
      { id: 'e1', name: 'Goblin', hp: 0, energy: 0, buffs: {}, team: 'enemy' }
    ],
    logMessage: 'Goblin takes 6'
  },
  {
    actorId: 'e1',
    actionType: 'death',
    details: {},
    targets: [],
    preState: [
      { id: 'p1', name: 'Hero', hp: 10, energy: 1, buffs: {}, team: 'party' },
      { id: 'e1', name: 'Goblin', hp: 0, energy: 0, buffs: {}, team: 'enemy' }
    ],
    postState: [
      { id: 'p1', name: 'Hero', hp: 10, energy: 1, buffs: {}, team: 'party' },
      { id: 'e1', name: 'Goblin', hp: 0, energy: 0, buffs: {}, team: 'enemy' }
    ],
    logMessage: 'Goblin is defeated'
  },
  {
    actorId: 'p1',
    actionType: 'endBattle',
    details: { result: 'victory' },
    targets: [],
    preState: [
      { id: 'p1', name: 'Hero', hp: 10, energy: 1, buffs: {}, team: 'party' },
      { id: 'e1', name: 'Goblin', hp: 0, energy: 0, buffs: {}, team: 'enemy' }
    ],
    postState: [
      { id: 'p1', name: 'Hero', hp: 10, energy: 1, buffs: {}, team: 'party' },
      { id: 'e1', name: 'Goblin', hp: 0, energy: 0, buffs: {}, team: 'enemy' }
    ],
    logMessage: 'Hero wins'
  }
]
