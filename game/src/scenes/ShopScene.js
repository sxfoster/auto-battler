import Phaser from 'phaser'
import { loadGameState, saveGameState } from '../state'

export default class ShopScene extends Phaser.Scene {
  constructor() {
    super('shop')
  }

  create() {
    this.cameras.main.fadeIn(250)
    this.add.text(400, 250, 'Shop', { fontSize: '24px' }).setOrigin(0.5)
    this.add
      .text(400, 300, 'Click to return', { fontSize: '16px' })
      .setOrigin(0.5)
    this.input.once('pointerdown', () => {
      const state = loadGameState()
      state.location = 'dungeon'
      saveGameState(state)
      this.cameras.main.fadeOut(250)
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('dungeon')
      })
    })
  }
}
