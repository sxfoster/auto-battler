import Phaser from 'phaser'
import { enemies } from 'shared/models'
import { chooseEnemyAction, trackEnemyActions, chooseTarget } from 'shared/systems/enemyAI.js'
import { canUseAbility, applyCooldown, tickCooldowns } from 'shared/systems/abilities.js'
import { InitiativeQueue } from 'shared/initiativeQueue.js'
import { floatingText } from './effects'
import { sampleCharacters } from 'shared/models/characters.js'
import { sampleCards } from 'shared/models/cards.js'

interface SceneData {
  enemyIndex?: number
  party?: any[]
}

export default class BattleScene extends Phaser.Scene {
  private enemyIndex = 0
  private party: any[] = []
  private enemy: any
  private enemies: any[] = []
  private combatants: any[] = []
  private turnOrder: any[] = []
  private turnIndex = 0
  private turnNumber = 0
  private enemyGroup: any = { lastUsedCards: [] }
  private playerSprites: any[] = []
  private enemySprites: any[] = []
  private turnText!: Phaser.GameObjects.Text
  private cardTexts: Phaser.GameObjects.Text[] = []
  private current: any
  private initiativeQueue!: InitiativeQueue
  private emitState(msg?: string) {
    const detail: any = msg
      ? { type: 'log', message: msg }
      : {
          type: 'state',
          players: this.turnOrder
            .filter((c) => c.type === 'player')
            .map((c) => ({ id: c.data.id, name: c.data.name, hp: c.hp })),
          enemies: this.turnOrder
            .filter((c) => c.type === 'enemy')
            .map((c) => ({ id: c.data.id, name: c.data.name, hp: c.hp })),
        }
    window.dispatchEvent(new CustomEvent('battleState', { detail }))
  }

  private getSprite(combatant: any) {
    return (
      this.playerSprites.find((s) => s.data.id === combatant.data.id) ||
      this.enemySprites.find((s) => s.data.id === combatant.data.id)
    )
  }

  private draw(combatant: any, count = 1) {
    if (!combatant.data.hand) {
      combatant.data.hand = []
    }
    const available = combatant.data.deck.filter((c: any) => canUseAbility(combatant.data, c))
    for (let i = 0; i < count; i++) {
      const pool = available.length ? available : combatant.data.deck
      const card = Phaser.Math.RND.pick(pool)
      combatant.data.hand.push(card)
    }
  }

  private showFloat(text: string, combatant: any, color: string) {
    const sprite = this.getSprite(combatant)
    if (sprite) {
      floatingText(this, text, sprite.rect.x, sprite.rect.y - 40, color)
    }
  }

  private getPlayerUnits() {
    return this.combatants.filter((c) => c.type === 'player')
  }

  private getEnemyUnits() {
    return this.combatants.filter((c) => c.type === 'enemy')
  }

  private selectTarget(unit: any) {
    const opponents = unit.type === 'player' ? this.getEnemyUnits() : this.getPlayerUnits()
    return opponents.find((o) => o.hp > 0)
  }


  private pickPlayableCard(unit: any) {
    unit.data.hand = unit.data.hand || []
    if (unit.data.hand.length === 0) {
      this.draw(unit, 1)
    }
    return unit.data.hand.find(
      (c: any) => (c.energyCost || 0) <= (unit.energy || 0),
    )
  }

  private regenEnergy(combatant: any, amount = 1) {
    const max = combatant.data.stats.energy || 0
    combatant.energy = Math.min(max, (combatant.energy || 0) + amount)
  }

  constructor() {
    super('battle')
  }

  init(data: SceneData) {
    this.enemyIndex = data.enemyIndex || 0
    this.party = (data.party || []).map((m: any) => {
      const base = sampleCharacters.find((c) => c.id === m.class)
      const cards = (m.cards || [])
        .map((cid: string) => sampleCards.find((sc) => sc.id === cid))
        .filter(Boolean)
      const deck = cards.length ? cards : base?.deck || []
      return base ? { ...base, deck } : { ...m, deck }
    })
  }

  create() {
    // party populated from init

    this.enemy = enemies[this.enemyIndex]
    this.enemies = [JSON.parse(JSON.stringify(this.enemy))]

    this.combatants = [
      ...this.party.map((c: any, idx: number) => ({ type: 'player', data: c, hp: c.stats.hp, speed: c.stats.speed, position: idx })),
      ...this.enemies.map((e: any, idx: number) => ({ type: 'enemy', data: e, hp: e.stats.hp, speed: e.stats.speed, position: idx })),
    ]
    this.turnOrder = this.combatants.sort((a, b) => b.speed - a.speed)
    this.turnIndex = 0

    this.initiativeQueue = new InitiativeQueue()
    const playerUnits = this.getPlayerUnits()
    const enemyUnits = this.getEnemyUnits()
    ;[...playerUnits, ...enemyUnits].forEach((unit) => {
      const initialDelay = 1000 / unit.speed
      this.initiativeQueue.add(unit, initialDelay)
    })

    this.drawBattlefield()
  }

  private drawBattlefield() {
    this.playerSprites = []
    this.enemySprites = []
    const startY = 150
    const offsetY = 100

    this.party.forEach((p: any, i: number) => {
      const y = startY + i * offsetY
      const rect = this.add.rectangle(150, y, 60, 60, 0x6699ff).setOrigin(0.5)
      const hpText = this.add.text(110, y + 40, '', { fontSize: '16px' })
      this.playerSprites.push({ rect, hpText, data: p })
    })

    this.enemies.forEach((e: any, i: number) => {
      const y = startY + i * offsetY
      const rect = this.add.rectangle(650, y, 60, 60, 0xff6666).setOrigin(0.5)
      const hpText = this.add.text(610, y + 40, '', { fontSize: '16px' })
      this.enemySprites.push({ rect, hpText, data: e })
    })

    this.turnText = this.add.text(350, 50, '', { fontSize: '20px' })
    this.cardTexts = []
    this.emitState()
    this.updateHealth()
  }

  private updateHealth() {
    this.playerSprites.forEach((sprite) => {
      const combat = this.turnOrder.find((c) => c.type === 'player' && c.data.id === sprite.data.id)
      sprite.hpText.setText(`HP: ${combat.hp}`)
    })
    this.enemySprites.forEach((sprite) => {
      const combat = this.turnOrder.find((c) => c.type === 'enemy' && c.data.id === sprite.data.id)
      sprite.hpText.setText(`HP: ${combat.hp}`)
    })
    this.emitState()
  }

  private startTurn() {
    if (this.checkBattleEnd()) {
      this.endBattle()
      return
    }
    this.current = this.turnOrder[this.turnIndex % this.turnOrder.length]
    this.turnNumber += 1
    this.turnText.setText(`${this.current.data.name}'s turn`)
    this.turnOrder.forEach((c) => tickCooldowns(c.data))
    this.emitState(`${this.current.data.name}'s turn`)

    if (this.current.type === 'player') {
      this.current.data.hand = []
      this.draw(this.current, 2)
      this.showPlayerCards()
    } else {
      this.time.delayedCall(500, () => {
        this.enemyAction()
      })
    }
  }

  private showPlayerCards() {
    this.clearCards()
    const hand = this.current.data.hand || []
    hand.forEach((card: any, idx: number) => {
      const cd = this.current.data.cooldowns?.[card.id] || 0
      const label = cd > 0 ? `${card.name} (${cd})` : `${card.name}\n${card.description}`
      const txt = this.add.text(100 + idx * 120, 500, label, {
        fontSize: '16px',
        backgroundColor: '#ddd',
        padding: 5,
        align: 'center',
      })
      if (cd === 0) {
        txt.setInteractive().on('pointerdown', () => {
          this.resolveCard(card, this.current, this.enemies[0])
        })
      } else {
        txt.setFill('#777777')
      }
      this.cardTexts.push(txt)
    })
  }

  private clearCards() {
    this.cardTexts.forEach((t) => t.destroy())
    this.cardTexts = []
  }

  private enemyAction() {
    const players = this.turnOrder.filter((c) => c.type === 'player')
    const context = {
      currentTurn: this.turnNumber,
      group: this.enemyGroup,
      enemyHP: this.current.hp,
      enemyMaxHP: this.current.data.stats.hp,
      players,
    }
    let card = chooseEnemyAction(this.current.data, context)
    if (!canUseAbility(this.current.data, card)) {
      const available = this.current.data.deck.filter((c: any) => canUseAbility(this.current.data, c))
      card = available.length ? Phaser.Math.RND.pick(available) : card
    }
    const targetCombat = chooseTarget(players) || players[0]
    if (card.isComboFinisher) {
      console.log(`${this.current.data.name} executes combo ${card.synergyTag}`)
    }
    trackEnemyActions(this.current.data, card, this.turnNumber, this.enemyGroup)
    this.resolveCard(
      card,
      this.current,
      targetCombat
    )
  }

  private resolveCard(card: any, actor: any, target: any) {
    this.showFloat(card.name, actor, '#ffff66')
    card.effects.forEach((effect: any) => {
      if (effect.type === 'damage') {
        target.hp -= effect.value
        this.showFloat(`-${effect.value}`, target, '#ff4444')
      }
      if (effect.type === 'heal') {
        actor.hp = Math.min(actor.data.stats.hp, actor.hp + effect.value)
        this.showFloat(`+${effect.value}`, actor, '#44ff44')
      }
    })
    applyCooldown(actor.data, card)
    this.emitState(`${actor.data.name} used ${card.name}`)
    this.updateHealth()
    this.clearCards()
    this.nextTurn()
  }

  private nextTurn() {
    this.turnIndex = (this.turnIndex + 1) % this.turnOrder.length
    this.startTurn()
  }

  private checkBattleEnd() {
    const playersAlive = this.turnOrder.some((c) => c.type === 'player' && c.hp > 0)
    const enemiesAlive = this.turnOrder.some((c) => c.type === 'enemy' && c.hp > 0)
    return !playersAlive || !enemiesAlive
  }

  private endBattle() {
    const playersAlive = this.turnOrder.some((c) => c.type === 'player' && c.hp > 0)
    const enemiesAlive = this.turnOrder.some((c) => c.type === 'enemy' && c.hp > 0)
    this.clearCards()
    const text = !playersAlive ? 'Defeat' : 'Victory'
    this.add.text(360, 300, text, { fontSize: '32px' }).setOrigin(0.5)
    this.showFloat(text, this.current, text === 'Victory' ? '#44ff44' : '#ff4444')
    this.emitState(text)
    if (!enemiesAlive) {
      // clear enemy room etc. handled in JS version
    }
    this.time.delayedCall(1500, () => {
      this.scene.start('dungeon')
    })
  }

  private checkEnd() {
    if (this.checkBattleEnd()) {
      this.endBattle()
      return true
    }
    return false
  }

  update(time: number, delta: number) {
    if (!this.initiativeQueue) return
    this.initiativeQueue.update(delta)
    const readyUnits = this.initiativeQueue.getReadyUnits()
    readyUnits.forEach((entry) => {
      const { unit } = entry
      if (unit.hp > 0) {
        const target = this.selectTarget(unit)
        if (target) {
          const card = this.pickPlayableCard(unit)
          if (card) {
            this.current = unit
            this.resolveCard(card, unit, target)
            unit.data.hand = unit.data.hand.filter((c: any) => c !== card)
          } else {
            this.regenEnergy(unit)
          }
          const newDelay = 1000 / unit.speed
          this.initiativeQueue.add(unit, newDelay)
        }
      }
      this.initiativeQueue.remove(unit)
    })

    if (readyUnits.length) {
      this.updateHealth()
    }

    if (this.checkBattleEnd()) {
      this.endBattle()
    }
  }
}

