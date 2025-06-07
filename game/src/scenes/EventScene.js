import Phaser from 'phaser'
import { loadGameState } from '../state'

export default class EventScene extends Phaser.Scene {
  constructor() {
    super('event')
  }

  create() {
    this.cameras.main.fadeIn(250)
    const state = loadGameState()
    const e = state.activeEvent || {}
    const desc = e.description || 'Something happens.'
    const name = e.name || 'Event'
    this.add.text(400, 240, name, { fontSize: '24px', align: 'center' }).setOrigin(0.5)
    this.add
      .text(400, 300, desc + '\nClick to continue', { fontSize: '16px', align: 'center' })
      .setOrigin(0.5)
    this.input.once('pointerdown', () => {
      this.cameras.main.fadeOut(250)
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('dungeon')
      })
    })
  }
}
