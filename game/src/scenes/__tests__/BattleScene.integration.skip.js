import Phaser from 'phaser';
import BattleScene from '../BattleScene.js';
import { partyState } from '../../shared/partyState.js';
import { loadGameState } from '../../state.js';

describe.skip('BattleScene integration', () => {
  let scene;
  beforeEach(() => {
    const config = { type: Phaser.HEADLESS, scene: [BattleScene], autoFocus: false };
    const game = new Phaser.Game(config);
    scene = game.scene.keys['battle'];
    partyState.members = [];
    loadGameState();
    scene.create();
  });

  it('runs through a full battle without crashing', (done) => {
    jest.spyOn(scene, 'endBattle').mockImplementation(() => {
      expect(scene.turnIndex).toBeGreaterThanOrEqual(0);
      done();
    });
    for (let i = 0; i < 100; i++) {
      scene.update(0, 100);
    }
  });
});
