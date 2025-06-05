import Phaser from 'phaser'
import { enemies } from 'shared/models'

export default class DungeonScene extends Phaser.Scene {
  constructor() {
    super('dungeon')
  }

  create() {
    // simple two room layout
    this.rooms = [
      { x: 150, y: 300, enemy: null, cleared: true },
      { x: 450, y: 300, enemy: enemies[0], cleared: false },
    ]
    // player starts in first room
    this.currentRoom = 0
    this.player = this.add.rectangle(0, 0, 40, 40, 0x00ff00)
    this.updatePlayerPosition()

    // show enemy rooms
    this.rooms.forEach((room, index) => {
      this.add.rectangle(room.x, room.y, 100, 100, 0x555555).setOrigin(0.5)
      if (room.enemy && !room.cleared) {
        room.sprite = this.add.rectangle(room.x, room.y, 40, 40, 0xff0000).setOrigin(0.5)
      }
    })

    this.input.keyboard.on('keydown-LEFT', () => this.move(-1))
    this.input.keyboard.on('keydown-RIGHT', () => this.move(1))
  }

  move(delta) {
    const next = Phaser.Math.Clamp(this.currentRoom + delta, 0, this.rooms.length - 1)
    this.currentRoom = next
    this.updatePlayerPosition()

    const room = this.rooms[this.currentRoom]
    if (room.enemy && !room.cleared) {
      this.scene.start('battle', { roomIndex: this.currentRoom })
    }
  }

  updatePlayerPosition() {
    const room = this.rooms[this.currentRoom]
    this.player.setPosition(room.x, room.y)
  }
}
