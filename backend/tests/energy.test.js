const GameEngine = require('../game/engine');
const { createCombatant } = require('../game/utils');

describe('Energy accumulation and ability usage', () => {
  test('ability triggers once enough energy is built', () => {
    const player = createCombatant({ hero_id: 1, ability_id: 3111 }, 'player', 0);
    const enemy = createCombatant({ hero_id: 2001 }, 'enemy', 0);

    const engine = new GameEngine([player, enemy]);

    // round 1
    engine.startRound();
    engine.processTurn(); // player
    let p = engine.combatants.find(c => c.team === 'player');
    expect(p.currentEnergy).toBe(1);
    expect(p.abilityCharges).toBe(10);
    engine.processTurn(); // enemy

    // round 2
    engine.startRound();
    engine.processTurn(); // player
    p = engine.combatants.find(c => c.team === 'player');
    expect(p.currentEnergy).toBe(2);
    expect(p.abilityCharges).toBe(10); // still unused
    engine.processTurn(); // enemy

    // round 3 - ability should fire
    engine.startRound();
    engine.processTurn(); // player
    p = engine.combatants.find(c => c.team === 'player');
    expect(p.currentEnergy).toBe(1);
    expect(p.abilityCharges).toBe(9);
    expect(engine.battleLog.some(l => l.includes('uses Power Strike'))).toBe(true);
  });

  test('enemy ability also triggers with sufficient energy', () => {
    const player = createCombatant({ hero_id: 1 }, 'player', 0);
    const enemy = createCombatant({ hero_id: 1, ability_id: 3111 }, 'enemy', 0);
    enemy.speed = 10;

    const engine = new GameEngine([player, enemy]);

    // round 1
    engine.startRound();
    engine.processTurn(); // enemy
    engine.processTurn(); // player

    // round 2
    engine.startRound();
    engine.processTurn(); // enemy
    engine.processTurn(); // player

    // round 3 - enemy ability should fire
    engine.startRound();
    engine.processTurn(); // enemy uses ability

    const e = engine.combatants.find(c => c.team === 'enemy');
    expect(e.currentEnergy).toBe(1);
    expect(e.abilityCharges).toBe(9);
    expect(engine.battleLog.some(l => l.includes('uses Power Strike'))).toBe(true);
  });
});
