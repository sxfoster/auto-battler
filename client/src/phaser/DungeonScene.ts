import Phaser from 'phaser'
import type { DungeonMap } from 'shared/models'

interface SceneData {
  dungeon: DungeonMap
  currentRoom: string
}

export default class DungeonScene extends Phaser.Scene {
  private dungeon!: DungeonMap
  private currentRoom!: string
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private roomRect?: Phaser.GameObjects.Rectangle

  constructor() {
    super('dungeon')
  }

  init(data: SceneData) {
    this.dungeon = data.dungeon
    this.currentRoom = data.currentRoom
  }

  create() {
    this.cursors = this.input.keyboard.createCursorKeys()
    this.drawRoom()
  }

  private drawRoom() {
    if (this.roomRect) this.roomRect.destroy()
    const room = this.dungeon.rooms[this.currentRoom]
    const colors: Record<string, number> = {
      enemy: 0xff0000,
      treasure: 0xffff00,
      trap: 0xff00ff,
      empty: 0x666666,
    }
    this.roomRect = this.add.rectangle(200, 200, 300, 300, colors[room.type] || 0x666666)
    this.add.text(16, 16, `Room: ${room.id}`, { color: '#ffffff' })
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left!)) {
      this.attemptMove(-1, 0)
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right!)) {
      this.attemptMove(1, 0)
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.up!)) {
      this.attemptMove(0, -1)
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down!)) {
      this.attemptMove(0, 1)
    }
  }

  private attemptMove(dx: number, dy: number) {
    const current = this.dungeon.rooms[this.currentRoom]
    const target = Object.values(this.dungeon.rooms).find(
      (r) => r.x === current.x + dx && r.y === current.y + dy,
    )
    if (target && current.connections.includes(target.id)) {
      this.currentRoom = target.id
      this.drawRoom()
      window.dispatchEvent(new CustomEvent('roomEnter', { detail: target.id }))
      this.triggerEvent(target.type)
    }
  }

  private triggerEvent(type: string) {
    switch (type) {
      case 'enemy':
        console.log('Enemy encountered!')
        break
      case 'treasure':
        console.log('Treasure found!')
        break
      case 'trap':
        console.log('A trap is sprung!')
        break
      default:
        break
    }
  }
}
