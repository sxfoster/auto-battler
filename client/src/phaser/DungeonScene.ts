import Phaser from 'phaser'
import type { DungeonData } from '../utils/generateDungeon'
import { enemies } from 'shared/models'

type SceneData = {
  dungeon: DungeonData
  playerPos: { x: number; y: number }
  explored: Set<string>
}

export default class DungeonScene extends Phaser.Scene {
  private dungeon!: DungeonData
  private playerPos!: { x: number; y: number }
  private explored!: Set<string>
  private tileSize = 32
  private mapGraphics!: Phaser.GameObjects.Graphics
  private fogGraphics!: Phaser.GameObjects.Graphics
  private highlightGraphics!: Phaser.GameObjects.Graphics
  private player!: Phaser.GameObjects.Rectangle
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private battleStarted = false

  constructor() {
    super('dungeon')
  }

  init(data: SceneData) {
    this.dungeon = data.dungeon
    this.playerPos = { ...data.playerPos }
    this.explored = new Set(data.explored)
  }

  create() {
    this.cursors = this.input.keyboard.createCursorKeys()
    this.mapGraphics = this.add.graphics()
    this.fogGraphics = this.add.graphics()
    this.highlightGraphics = this.add.graphics()

    this.drawMap()
    this.player = this.add
      .rectangle(0, 0, this.tileSize * 0.8, this.tileSize * 0.8, 0x00ff00)
      .setOrigin(0)
    this.updatePlayer()

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      const x = Math.floor(p.worldX / this.tileSize)
      const y = Math.floor(p.worldY / this.tileSize)
      this.attemptMove(x - this.playerPos.x, y - this.playerPos.y)
    })
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
    if (Math.abs(dx) + Math.abs(dy) !== 1) return
    const nx = this.playerPos.x + dx
    const ny = this.playerPos.y + dy
    if (this.isWalkable(nx, ny)) {
      this.playerPos = { x: nx, y: ny }
      this.updatePlayer()
      this.reveal(nx, ny)
      window.dispatchEvent(
        new CustomEvent('playerMove', {
          detail: { position: this.playerPos, explored: Array.from(this.explored) },
        }),
      )
      if (
        !this.battleStarted &&
        this.playerPos.x === this.dungeon.end.x &&
        this.playerPos.y === this.dungeon.end.y
      ) {
        this.battleStarted = true
        this.scene.start('battle', { enemyIndex: 0 })
      }
    }
  }

  private updatePlayer() {
    this.player.setPosition(this.playerPos.x * this.tileSize, this.playerPos.y * this.tileSize)
    this.updateReachable()
  }

  private drawMap() {
    const { width, height, tiles } = this.dungeon
    this.mapGraphics.clear()
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tile = tiles[y][x]
        const color = tile === 'wall' ? 0x333333 : 0x888888
        this.mapGraphics.fillStyle(color, 1)
        this.mapGraphics.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize)
        this.mapGraphics.lineStyle(1, 0x000000, 0.2)
        this.mapGraphics.strokeRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize)
      }
    }
    this.reveal(this.playerPos.x, this.playerPos.y)
  }

  private reveal(x: number, y: number) {
    const id = `${x},${y}`
    if (!this.explored.has(id)) this.explored.add(id)
    ;[
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ].forEach(([dx, dy]) => {
      const nx = x + dx
      const ny = y + dy
      if (nx >= 0 && nx < this.dungeon.width && ny >= 0 && ny < this.dungeon.height) {
        this.explored.add(`${nx},${ny}`)
      }
    })
    this.drawFog()
  }

  private drawFog() {
    const { width, height } = this.dungeon
    this.fogGraphics.clear()
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const id = `${x},${y}`
        if (!this.explored.has(id)) {
          this.fogGraphics.fillStyle(0x000000, 0.6)
          this.fogGraphics.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize)
        }
      }
    }
  }

  private updateReachable() {
    const dirs = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]
    this.highlightGraphics.clear()
    dirs.forEach(([dx, dy]) => {
      const nx = this.playerPos.x + dx
      const ny = this.playerPos.y + dy
      if (this.isWalkable(nx, ny)) {
        this.highlightGraphics.lineStyle(2, 0xffff00)
        this.highlightGraphics.strokeRect(nx * this.tileSize, ny * this.tileSize, this.tileSize, this.tileSize)
      }
    })
  }

  private isWalkable(x: number, y: number) {
    return (
      x >= 0 &&
      x < this.dungeon.width &&
      y >= 0 &&
      y < this.dungeon.height &&
      this.dungeon.tiles[y][x] === 'floor'
    )
  }
}
