import Phaser from 'phaser'
import { handleAdvance, handleRetreat } from 'shared/systems'
import { loadGameState, saveGameState } from '../state'

export default class DecisionScene extends Phaser.Scene {
  constructor() {
    super('decision')
  }

  create() {
    this.add.text(400, 200, 'Floor cleared! Choose an option', {
      fontSize: '24px',
    }).setOrigin(0.5)

    const adv = this.add
      .text(250, 300, 'Advance', { fontSize: '32px', color: '#00ff00' })
      .setOrigin(0.5)
      .setInteractive()

    const ret = this.add
      .text(550, 300, 'Retreat', { fontSize: '32px', color: '#00aaff' })
      .setOrigin(0.5)
      .setInteractive()

    adv.on('pointerdown', () => {
      const state = loadGameState()
      handleAdvance(state)
      saveGameState(state)
      this.scene.start('dungeon')
    })

    ret.on('pointerdown', () => {
      const state = loadGameState()
      handleRetreat(state)
      saveGameState(state)
      this.scene.start('town')
    })
  }
}
