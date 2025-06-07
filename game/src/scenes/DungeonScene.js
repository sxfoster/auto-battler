import Phaser from 'phaser'
import { enemies } from 'shared/models'
import { getCurrentBiome } from 'shared/systems/biome.js'
import { loadGameState } from '../state'

export default class DungeonScene extends Phaser.Scene {
  constructor() {
    super('dungeon')
  }

  init(data) {
    this.currentRoom = data?.roomIndex || 0
  }

  create() {
    this.gameState = loadGameState()
    const biome = getCurrentBiome(this.gameState)
    this.add.text(400, 50, `Floor ${this.gameState.currentFloor}`, { fontSize: '20px' }).setOrigin(0.5)
    this.add.text(400, 80, biome.name, { fontSize: '18px' }).setOrigin(0.5)
    if (this.gameState.activeEvent) {
      this.add.text(400, 110, this.gameState.activeEvent.name, { fontSize: '16px', color: '#ffff00' }).setOrigin(0.5)
    }

    // simple two room layout
    this.rooms = [
      { x: 150, y: 300, enemy: null, cleared: true },
      { x: 450, y: 300, enemy: enemies[0], cleared: false },
    ]
    // ensure currentRoom has a value
    if (typeof this.currentRoom !== 'number') {
      this.currentRoom = 0
    }
    this.player = this.add.rectangle(0, 0, 40, 40, 0x00ff00)
    this.updatePlayerPosition()

    this.events.on('wake', this.onWake, this)

    // show enemy rooms
    this.rooms.forEach((room, index) => {
      room.rect = this.add
        .rectangle(room.x, room.y, 100, 100, 0x555555)
        .setOrigin(0.5)
        .setInteractive()

      if (room.enemy && !room.cleared) {
        room.sprite = this.add.rectangle(room.x, room.y, 40, 40, 0xff0000).setOrigin(0.5)
      }

      room.rect.on('pointerdown', () => {
        if (index === this.currentRoom) return
        this.currentRoom = index
        this.cameras.main.fadeOut(300, 0, 0, 0)
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.restart({ roomIndex: this.currentRoom })
        })
      })
    })

    const current = this.rooms[this.currentRoom]
    if (current && current.rect) {
      this.tweens.add({
        targets: current.rect,
        scale: 1.05,
        yoyo: true,
        repeat: -1,
        duration: 800,
        ease: 'Sine.easeInOut',
      })
    }

    this.input.keyboard.on('keydown-LEFT', () => this.move(-1))
    this.input.keyboard.on('keydown-RIGHT', () => this.move(1))
  }

  move(delta) {
    const next = Phaser.Math.Clamp(this.currentRoom + delta, 0, this.rooms.length - 1)
    this.currentRoom = next
    this.updatePlayerPosition()

    const room = this.rooms[this.currentRoom]
    if (room.enemy && !room.cleared) {
      this.scene.launch('battle', { roomIndex: this.currentRoom })
      this.scene.sleep()
    } else {
      this.checkFloorComplete()
    }
  }

  updatePlayerPosition() {
    const room = this.rooms[this.currentRoom]
    this.player.setPosition(room.x, room.y)
  }

  onWake() {
    this.updatePlayerPosition()
    this.checkFloorComplete()
  }

  checkFloorComplete() {
    const done = this.rooms.every((r) => r.cleared)
    if (done) {
      this.scene.start('decision')
    }
  }
}
