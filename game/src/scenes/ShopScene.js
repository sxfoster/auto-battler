import Phaser from 'phaser'

export default class ShopScene extends Phaser.Scene {
  constructor() {
    super('shop')
  }

  create() {
    this.cameras.main.fadeIn(250)
    this.add
      .text(400, 300, 'Shop - press SPACE to return', { fontSize: '20px' })
      .setOrigin(0.5)

    this.input.keyboard.once('keydown-SPACE', () => {
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.stop()
        const dungeon = this.scene.get('dungeon')
        dungeon.cameras.main.fadeIn(250)
        this.scene.wake('dungeon')
      })
      this.cameras.main.fadeOut(250)
    })
  }
}
