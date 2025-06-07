import Phaser from 'phaser'
import { generateDungeon, loadDungeon, getDungeon, moveTo, saveDungeon } from 'shared/dungeonState'

export default class DungeonScene extends Phaser.Scene {
  constructor() {
    super('dungeon')
  }

  create() {
    loadDungeon()
    if (!getDungeon()) {
      generateDungeon(5, 5)
      saveDungeon()
    }
    const { rooms, current } = getDungeon()
    const size = 64
    const offsetX = 100
    const offsetY = 100

    rooms.forEach((r) => {
      const color =
        r.x === current.x && r.y === current.y
          ? 0x50fa7b
          : r.visited
          ? 0x44475a
          : 0x1f2230
      const rect = this.add
        .rectangle(offsetX + r.x * size, offsetY + r.y * size, size - 4, size - 4, color)
        .setInteractive()
      rect.on('pointerdown', () => {
        moveTo(r.x, r.y)
        this.scene.restart()
      })
    })
  }
}
