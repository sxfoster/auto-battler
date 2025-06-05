import Phaser from 'phaser'
import { enemies } from 'shared/models'

export default class BattleScene extends Phaser.Scene {
  constructor() {
    super('battle')
  }

  preload() {
    // Placeholder preload - no external assets yet
  }

  create() {
    const partyDataJSON = localStorage.getItem('partyData')
    if (partyDataJSON) {
      try {
        const parsed = JSON.parse(partyDataJSON)
        // Support both the legacy array format and the Party interface which
        // stores characters under a `characters` field.
        this.party = Array.isArray(parsed) ? parsed : parsed.characters || []
      } catch (error) {
        console.error('Error parsing party data:', error)
        this.party = []
      }
    } else {
      console.warn('No party data found in localStorage.')
      this.party = []
    }
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

      const name = enemy.name || enemy.archetype || enemy.id
      const hp =
        enemy.hp !== undefined
          ? enemy.hp
          : enemy.stats && enemy.stats.hp !== undefined
            ? enemy.stats.hp
            : 0
      const energy =
        enemy.energy !== undefined
          ? enemy.energy
          : enemy.stats && enemy.stats.energy !== undefined
            ? enemy.stats.energy
            : 0

      this.add.text(startX + 90, y, name, { fontSize: '16px' })
      this.add.text(startX + 90, y + 20, `HP: ${hp}`)
      this.add.text(startX + 90, y + 40, `Energy: ${energy}`)

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
