import Phaser from 'phaser';
import type { Dungeon, TileType } from './generateDungeon';

interface SceneConfig {
  dungeon: Dungeon;
  onPlayerMove?: (pos: { x: number; y: number }) => void;
}

export default class DungeonScene extends Phaser.Scene {
  private dungeon: Dungeon;
  private onPlayerMove?: (pos: { x: number; y: number }) => void;
  private tileSize = 32;
  private playerPos!: { x: number; y: number };
  private explored!: boolean[][];
  private graphics!: Phaser.GameObjects.Graphics;
  private hoverTile: { x: number; y: number } | null = null;

  constructor(config: SceneConfig) {
    super('dungeon');
    this.dungeon = config.dungeon;
    this.onPlayerMove = config.onPlayerMove;
  }

  create() {
    this.playerPos = { ...this.dungeon.start };
    this.explored = Array.from({ length: this.dungeon.height }, () =>
      Array.from({ length: this.dungeon.width }, () => false),
    );
    this.explored[this.playerPos.y][this.playerPos.x] = true;
    this.graphics = this.add.graphics();

    this.input.on('pointerdown', this.handlePointerDown, this);
    this.input.on('pointermove', this.handlePointerMove, this);

    this.draw();
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer) {
    const tx = Math.floor(pointer.x / this.tileSize);
    const ty = Math.floor(pointer.y / this.tileSize);
    if (this.canMoveTo(tx, ty)) {
      this.playerPos = { x: tx, y: ty };
      this.explored[ty][tx] = true;
      this.onPlayerMove?.(this.playerPos);
      this.draw();
    }
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer) {
    const tx = Math.floor(pointer.x / this.tileSize);
    const ty = Math.floor(pointer.y / this.tileSize);
    if (this.canMoveTo(tx, ty)) {
      this.hoverTile = { x: tx, y: ty };
    } else {
      this.hoverTile = null;
    }
    this.draw();
  }

  private canMoveTo(x: number, y: number): boolean {
    const { width, height, tiles } = this.dungeon;
    if (x < 0 || y < 0 || x >= width || y >= height) return false;
    if (tiles[y][x] === 'wall') return false;
    const dist = Math.abs(x - this.playerPos.x) + Math.abs(y - this.playerPos.y);
    return dist === 1; // only adjacent tiles
  }

  private draw() {
    const { width, height, tiles } = this.dungeon;
    const size = this.tileSize;
    this.graphics.clear();

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (!this.explored[y][x] && this.isAdjacent(x, y, this.playerPos.x, this.playerPos.y)) {
          this.explored[y][x] = true;
        }
        const visible = this.explored[y][x];
        const tile = tiles[y][x];
        let color = 0x000000;
        if (visible) {
          if (tile === 'wall') color = 0x222222;
          if (tile === 'floor') color = 0x555555;
          if (tile === 'start') color = 0x227722;
          if (tile === 'end') color = 0x772222;
        }
        this.graphics.fillStyle(color, 1);
        this.graphics.fillRect(x * size, y * size, size, size);
        this.graphics.lineStyle(1, 0x444444, 0.5);
        this.graphics.strokeRect(x * size, y * size, size, size);
      }
    }

    if (this.hoverTile) {
      this.graphics.fillStyle(0xffff00, 0.5);
      this.graphics.fillRect(
        this.hoverTile.x * size,
        this.hoverTile.y * size,
        size,
        size,
      );
    }

    // player indicator
    this.graphics.fillStyle(0x0000ff, 1);
    this.graphics.fillCircle(
      this.playerPos.x * size + size / 2,
      this.playerPos.y * size + size / 2,
      size / 2 - 4,
    );
  }

  private isAdjacent(x1: number, y1: number, x2: number, y2: number) {
    return Math.abs(x1 - x2) <= 1 && Math.abs(y1 - y2) <= 1;
  }
}
