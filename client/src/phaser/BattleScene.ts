import Phaser from 'phaser'
import { enemies } from 'shared/models'

interface SceneData {
  enemyIndex?: number
}

export default class BattleScene extends Phaser.Scene {
  private enemyIndex = 0
  private party: any[] = []
  private enemy: any
  private enemies: any[] = []
  private combatants: any[] = []
  private turnOrder: any[] = []
  private turnIndex = 0
  private playerSprites: any[] = []
  private enemySprites: any[] = []
  private turnText!: Phaser.GameObjects.Text
  private cardTexts: Phaser.GameObjects.Text[] = []
  private current: any

  constructor() {
    super('battle')
  }

  init(data: SceneData) {
    this.enemyIndex = data.enemyIndex || 0
  }

  create() {
    const partyDataJSON = localStorage.getItem('partyData')
    if (partyDataJSON) {
      try {
        const parsed = JSON.parse(partyDataJSON)
        this.party = Array.isArray(parsed) ? parsed : parsed.characters || []
      } catch (e) {
        console.error('Failed to parse party data', e)
        this.party = []
      }
    }

    this.enemy = enemies[this.enemyIndex]
    this.enemies = [JSON.parse(JSON.stringify(this.enemy))]

    this.combatants = [
      ...this.party.map((c: any) => ({ type: 'player', data: c, hp: c.stats.hp, speed: c.stats.speed })),
      ...this.enemies.map((e: any) => ({ type: 'enemy', data: e, hp: e.stats.hp, speed: e.stats.speed })),
    ]
    this.turnOrder = this.combatants.sort((a, b) => b.speed - a.speed)
    this.turnIndex = 0

    this.drawBattlefield()
    this.startTurn()
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
  }

  private startTurn() {
    if (this.checkEnd()) return
    this.current = this.turnOrder[this.turnIndex % this.turnOrder.length]
    this.turnText.setText(`${this.current.data.name}'s turn`)

    if (this.current.type === 'player') {
      this.showPlayerCards()
    } else {
      this.time.delayedCall(500, () => {
        this.enemyAction()
      })
    }
  }

  private showPlayerCards() {
    this.clearCards()
    const hand = this.current.data.deck
    hand.forEach((card: any, idx: number) => {
      const txt = this.add
        .text(100 + idx * 120, 500, card.name, { fontSize: '16px', backgroundColor: '#ddd', padding: 5 })
        .setInteractive()
        .on('pointerdown', () => {
          this.resolveCard(card, this.current, this.enemies[0])
        })
      this.cardTexts.push(txt)
    })
  }

  private clearCards() {
    this.cardTexts.forEach((t) => t.destroy())
    this.cardTexts = []
  }

  private enemyAction() {
    const card = this.current.data.deck[0]
    const target = this.party[0]
    this.resolveCard(card, this.current, this.turnOrder.find((c) => c.data.id === target.id))
  }

  private resolveCard(card: any, actor: any, target: any) {
    card.effects.forEach((effect: any) => {
      if (effect.type === 'damage') {
        target.hp -= effect.value
      }
      if (effect.type === 'heal') {
        actor.hp = Math.min(actor.data.stats.hp, actor.hp + effect.value)
      }
    })
    this.updateHealth()
    this.clearCards()
    this.nextTurn()
  }

  private nextTurn() {
    this.turnIndex = (this.turnIndex + 1) % this.turnOrder.length
    this.startTurn()
  }

  private checkEnd() {
    const playersAlive = this.turnOrder.some((c) => c.type === 'player' && c.hp > 0)
    const enemiesAlive = this.turnOrder.some((c) => c.type === 'enemy' && c.hp > 0)
    if (!playersAlive || !enemiesAlive) {
      this.clearCards()
      const text = !playersAlive ? 'Defeat' : 'Victory'
      this.add.text(360, 300, text, { fontSize: '32px' }).setOrigin(0.5)
      this.time.delayedCall(1500, () => {
        if (playersAlive) {
          this.scene.start('decision')
        } else {
          this.scene.start('dungeon')
        }
      })
      return true
    }
    return false
  }
}

