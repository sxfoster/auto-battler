const GameEngine = require('../game/engine');
const { createCombatant } = require('../game/utils');

describe('runGameSteps generator', () => {
  test('yields battle steps sequentially', () => {
    const player = createCombatant({ hero_id: 1 }, 'player', 0);
    const enemy = createCombatant({ hero_id: 2001 }, 'enemy', 0);
    const engine = new GameEngine([player, enemy]);
    const steps = Array.from(engine.runGameSteps());
    expect(steps.length).toBeGreaterThan(1);
    expect(steps[0].log[0]).toContain('Battle Starting');
    const last = steps[steps.length - 1];
    expect(last.log.join('\n')).toContain('Battle Finished');
  });
});
