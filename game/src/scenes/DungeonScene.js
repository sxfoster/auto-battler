import Phaser from 'phaser'
import { getDungeon, moveTo } from 'shared/dungeonState'

export default class DungeonScene extends Phaser.Scene {
  constructor() { super('dungeon') }
  create() {
    const { width, height, rooms, current } = getDungeon()
    const size = 64, offsetX = 100, offsetY = 100
    rooms.forEach(r => {
      const color = r.x===current.x && r.y===current.y
        ? 0x50fa7b : r.visited ? 0x44475a : 0x1f2230
      const rect = this.add.rectangle(
        offsetX + r.x*size,
        offsetY + r.y*size,
        size-4,
        size-4,
        color
      ).setInteractive()
      rect.on('pointerdown', () => {
        moveTo(r.x,r.y)
        this.scene.restart()  // re-draw grid with new state
      })
    })
  }
}
