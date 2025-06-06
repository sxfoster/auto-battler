import Phaser from 'phaser'
import { loadGameState, saveGameState } from 'shared/gameState'

export default class DecisionScene extends Phaser.Scene {
  constructor() {
    super('decision')
  }

  create() {
    this.add.text(400, 200, 'Continue deeper or retreat?', { fontSize: '20px' }).setOrigin(0.5)

    const advance = this.add
      .text(300, 300, 'Advance', { backgroundColor: '#2ecc71', padding: { x: 10, y: 5 } })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => this.handleAdvance())

    const retreat = this.add
      .text(500, 300, 'Retreat', { backgroundColor: '#3498db', padding: { x: 10, y: 5 } })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => this.handleRetreat())
  }

  handleAdvance() {
    const state = loadGameState()
    state.currentFloor += 1
    state.dungeonDifficulty += 1
    state.playerStatus.fatigue += 1
    state.playerStatus.hunger += 1
    state.playerStatus.thirst += 1
    state.location = 'dungeon'
    saveGameState(state)
    this.scene.start('dungeon')
  }

  handleRetreat() {
    const state = loadGameState()
    state.currentFloor = 1
    state.dungeonDifficulty = 1
    state.location = 'town'
    saveGameState(state)
    this.scene.start('dungeon')
  }
}
