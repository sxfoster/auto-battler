import Phaser from 'phaser'
import { generateDungeon, loadDungeon, getDungeon, moveTo, saveDungeon } from 'shared/dungeonState'

export default class DungeonScene extends Phaser.Scene {
  constructor() {
    super('dungeon')
  }

  create() {
    this.cameras.main.fadeIn(250)
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
        this.cameras.main.fadeOut(250)
        this.cameras.main.once('camerafadeoutcomplete', () => {
          moveTo(r.x, r.y)
          const { rooms } = getDungeon()
          const idx = rooms.findIndex((room) => room.x === r.x && room.y === r.y)
          const room = rooms[idx]
          switch (room.type) {
            case 'combat':
              this.scene.launch('battle', { roomIndex: idx })
              this.scene.sleep()
              break
            case 'shop':
              this.scene.start('shop')
              break
            case 'event':
              this.scene.start('event')
              break
            default:
              this.scene.restart()
          }
        })
      })
    })
  }
}
