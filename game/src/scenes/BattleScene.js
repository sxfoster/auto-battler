import Phaser from 'phaser'
import { simulateBattle } from '../logic/battleSimulator.js'
import { partyState, loadPartyState } from '../shared/partyState.js'

export default class BattleScene extends Phaser.Scene {
  constructor() {
    super('battle')
    this.roomIndex = 0
    this.party = []
    this.enemies = []
  }

  init(data) {
    this.roomIndex = data.roomIndex || 0
  }

  preload() {
    loadPartyState()
    this.party = partyState.members
    const dungeon = this.scene.get('dungeon')
    const enemy = dungeon?.rooms?.[this.roomIndex]?.enemy
    this.enemies = enemy ? [JSON.parse(JSON.stringify(enemy))] : []
  }

  create() {
    const events = simulateBattle(this.party, this.enemies)
    const order = [
      ...this.party.map(p => p.id),
      ...this.enemies.map(e => e.id)
    ]
    const combatants = {}
    this.party.forEach(p => {
      combatants[p.id] = {
        id: p.id,
        name: p.name,
        portraitUrl: p.portrait,
        maxHp: p.stats?.hp || 0,
        currentHp: p.stats?.hp || 0,
        currentEnergy: 0,
        type: 'player'
      }
    })
    this.enemies.forEach(e => {
      combatants[e.id] = {
        id: e.id,
        name: e.name,
        portraitUrl: e.portrait,
        maxHp: e.stats?.hp || 0,
        currentHp: e.stats?.hp || 0,
        currentEnergy: 0,
        type: 'enemy'
      }
    })
    this.events.emit('initial-state', { order, combatants })

    events.forEach((evt, idx) => {
      this.time.delayedCall(idx * 500, () => {
        this.events.emit(evt.type, evt)
      })
    })
  }
}
