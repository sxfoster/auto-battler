import Phaser from 'phaser'
import { enemies } from 'shared/models'
import { getCurrentBiome } from 'shared/systems/biome.js'
import { loadGameState } from '../state'

export default class DungeonScene extends Phaser.Scene {
  constructor() {
    super('dungeon')
  }

  create() {
    this.gameState = loadGameState()
    const biome = getCurrentBiome(this.gameState)
    this.add.text(400, 50, `Floor ${this.gameState.currentFloor}`, { fontSize: '20px' }).setOrigin(0.5)
    this.add.text(400, 80, biome.name, { fontSize: '18px' }).setOrigin(0.5)
    if (this.gameState.activeEvent) {
      this.add.text(400, 110, this.gameState.activeEvent.name, { fontSize: '16px', color: '#ffff00' }).setOrigin(0.5)
    }

    // simple layout with different room types
    this.rooms = [
      { x: 150, y: 300, type: 'shop', cleared: false },
      { x: 300, y: 300, type: 'enemy', enemy: enemies[0], cleared: false },
      { x: 450, y: 300, type: 'event', cleared: false },
      { x: 600, y: 300, type: 'empty', cleared: true },
    ]
    // player starts in first room
    this.currentRoom = 0
    this.player = this.add.rectangle(0, 0, 40, 40, 0x00ff00)
    this.updatePlayerPosition()

    this.events.on('wake', this.onWake, this)

    // visualize rooms
    this.rooms.forEach((room) => {
      this.add.rectangle(room.x, room.y, 100, 100, 0x555555).setOrigin(0.5)
      if (!room.cleared) {
        let color = 0xaaaaaa
        if (room.type === 'enemy') color = 0xff0000
        if (room.type === 'shop') color = 0x0000ff
        if (room.type === 'event') color = 0xffff00
        room.sprite = this.add.rectangle(room.x, room.y, 40, 40, color).setOrigin(0.5)
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
    if (!room.cleared) {
      switch (room.type) {
        case 'enemy':
          this.transitionToScene('battle', { roomIndex: this.currentRoom })
          break
        case 'shop':
          room.cleared = true
          this.transitionToScene('shop')
          break
        case 'event':
          room.cleared = true
          this.transitionToScene('event')
          break
        default:
          this.checkFloorComplete()
          break
      }
    } else {
      this.checkFloorComplete()
    }
  }

  transitionToScene(key, data) {
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.launch(key, data)
      this.scene.sleep()
      const target = this.scene.get(key)
      if (target) {
        target.cameras.main.fadeIn(250)
      }
    })
    this.cameras.main.fadeOut(250)
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
