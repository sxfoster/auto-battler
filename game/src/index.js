import Phaser from 'phaser'
import BattleScene from './scenes/BattleScene'

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  scene: [BattleScene],
}

new Phaser.Game(config)
