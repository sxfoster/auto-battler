import Phaser from 'phaser'
import BattleScene from './scenes/BattleScene'
import DungeonScene from './scenes/DungeonScene'
import DecisionScene from './scenes/DecisionScene'
import TownScene from './scenes/TownScene'
import ShopScene from './scenes/ShopScene'
import EventScene from './scenes/EventScene'
import { loadPartyState } from './shared/partyState.js'

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  scene: [TownScene, DungeonScene, BattleScene, DecisionScene, ShopScene, EventScene],
}

loadPartyState()
new Phaser.Game(config)
