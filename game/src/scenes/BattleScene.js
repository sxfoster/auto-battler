import Phaser from 'phaser'
import { enemies } from 'shared/models'

function loadParty() {
  const data = localStorage.getItem('partyData')
  if (!data) return null
  try {
    return JSON.parse(data)
  } catch {
    return null
  }
}

export default class BattleScene extends Phaser.Scene {
  constructor() {
    super('battle')
  }

  preload() {
    // Placeholder preload - no external assets yet
  }

  create() {
    this.party = loadParty() || []
    this.createPartyDisplay()
    this.createEnemyDisplay()

    // Prepare turn sequence placeholders
    this.turnIndex = 0
    this.turnOrder = [...this.party, ...enemies]
  }

  createPartyDisplay() {
    const startX = 50
    const startY = 100
    const offsetY = 120

    this.party.forEach((member, index) => {
      const y = startY + index * offsetY

      // Placeholder rectangle for character
      this.add.rectangle(startX, y, 80, 80, 0x6699ff).setOrigin(0)

      this.add.text(startX + 90, y, member.name, { fontSize: '16px' })
      const hp =
        member.hp !== undefined
          ? member.hp
          : member.stats && member.stats.hp !== undefined
            ? member.stats.hp
            : 0
      const energy =
        member.energy !== undefined
          ? member.energy
          : member.stats && member.stats.energy !== undefined
            ? member.stats.energy
            : 0
      this.add.text(startX + 90, y + 20, `HP: ${hp}`)
      this.add.text(startX + 90, y + 40, `Energy: ${energy}`)

      const cards = member.deck || member.cards || []
      cards.forEach((card, cIndex) => {
        const cardX = startX + cIndex * 60
        const cardY = y + 90
        // Placeholder rectangle for card
        this.add.rectangle(cardX, cardY, 50, 70, 0xcccccc).setOrigin(0)
        this.add.text(cardX + 5, cardY + 5, card.name, { fontSize: '12px' })
      })
    })
  }

  createEnemyDisplay() {
    const startX = 500
    const startY = 100
    const offsetY = 120

    enemies.forEach((enemy, index) => {
      const y = startY + index * offsetY

      // Placeholder rectangle for character
      this.add.rectangle(startX, y, 80, 80, 0xff6666).setOrigin(0)

      this.add.text(startX + 90, y, enemy.name, { fontSize: '16px' })
      this.add.text(startX + 90, y + 20, `HP: ${enemy.hp}`)
      this.add.text(startX + 90, y + 40, `Energy: ${enemy.energy}`)

      const cards = enemy.cards || enemy.deck || []
      cards.forEach((card, cIndex) => {
        const cardX = startX + cIndex * 60
        const cardY = y + 90
        // Placeholder rectangle for card
        this.add.rectangle(cardX, cardY, 50, 70, 0xcccccc).setOrigin(0)
        this.add.text(cardX + 5, cardY + 5, card.name, { fontSize: '12px' })
      })
    })
  }

  update() {
    // Future turn sequencing logic will go here
  }
}
