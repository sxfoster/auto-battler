import Phaser from 'phaser'
import { floatingText } from '../effects.js'
import { simulateBattle } from '../logic/battleSimulator.js'
import { partyState, loadPartyState } from '../shared/partyState.js'

export default class BattleScene extends Phaser.Scene {
  constructor() {
    super('battle')
    this.roomIndex = 0
    this.party = []
    this.enemies = []
    this.playerSprites = []
    this.enemySprites = []
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
    this.drawBattlefield()

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

    this.events.on('turn-start',   ({ actorId }) => this.highlightActor(actorId))
    this.events.on('card-played',  ({ actorId }) => this.playCardAnim(actorId))
    this.events.on('damage',       ({ targetId, amount }) => {
      const sprite = this.getSpriteById(targetId)
      if (sprite) {
        floatingText(this, `-${amount}`, sprite.x, sprite.y - 40, '#ff4444')
        this.shakeSprite(sprite)
      }
    })
    this.events.on('heal',         ({ actorId, amount }) => {
      const sprite = this.getSpriteById(actorId)
      if (sprite) {
        floatingText(this, `+${amount}`, sprite.x, sprite.y - 40, '#44ff44')
      }
    })
    this.events.on('turn-skipped', ({ actorId }) => this.dimActor(actorId))
    this.events.on('battle-end',   ({ result }) => this.showEndOverlay(result))
  }

  drawBattlefield() {
    this.playerSprites = []
    this.enemySprites = []
    const startY = 150
    const offsetY = 100
    this.party.forEach((p, i) => {
      const y = startY + i * offsetY
      this.playerSprites.push({ ref: { x: 150, y }, data: p })
    })
    this.enemies.forEach((e, i) => {
      const y = startY + i * offsetY
      this.enemySprites.push({ ref: { x: 650, y }, data: e })
    })
  }

  getSprite(combatant) {
    return (
      this.playerSprites.find(s => s.data.id === combatant.id) ||
      this.enemySprites.find(s => s.data.id === combatant.id)
    )
  }

  getSpriteById(id) {
    return (
      this.playerSprites.find(s => s.data.id === id) ||
      this.enemySprites.find(s => s.data.id === id)
    )?.ref
  }

  highlightActor(id) {
    const sprite = this.getSpriteById(id)
    if (sprite && sprite.setTint) sprite.setTint(0xffff00)
  }

  dimActor(id) {
    const sprite = this.getSpriteById(id)
    if (sprite && sprite.clearTint) sprite.clearTint()
  }

  playCardAnim(id) {
    // placeholder for future animations
  }

  shakeSprite(sprite) {
    if (!sprite) return
    this.tweens.add({ targets: sprite, x: sprite.x + 5, duration: 50, yoyo: true, repeat: 2 })
  }

  showEndOverlay(result) {
    floatingText(this, result, 400, 300, '#ffffff')
  }
}
