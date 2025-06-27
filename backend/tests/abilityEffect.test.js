const GameEngine = require('../game/engine');
const { createCombatant } = require('../game/utils');

describe('Ability effect application', () => {
  test('Divine Strike deals damage and heals the caster', () => {
    const player = createCombatant({ hero_id: 1, ability_id: 3211 }, 'player', 0);
    const enemy = createCombatant({ hero_id: 1 }, 'enemy', 0);
    // weaken player to observe healing
    player.currentHp = player.maxHp - 4;
    // reduce enemy attack so player survives
    enemy.attack = 1;

    const engine = new GameEngine([player, enemy]);

    // two rounds to build energy
    engine.startRound();
    engine.processTurn(); // player
    engine.processTurn(); // enemy
    engine.startRound();
    engine.processTurn(); // player
    engine.processTurn(); // enemy

    // third round - ability should trigger
    engine.startRound();
    engine.processTurn(); // player uses Divine Strike

    const p = engine.combatants.find(c => c.team === 'player');
    const e = engine.combatants.find(c => c.team === 'enemy');

    expect(p.currentHp).toBe(player.maxHp - 4 - 2 + 2); // took 2 damage then healed 2

    const expectedEnemyHp = enemy.maxHp - player.attack * 2 - 2;
    expect(e.currentHp).toBe(expectedEnemyHp);

    // single log line should describe both damage and healing
    const lines = engine.battleLog.filter(l => l.includes('uses Divine Strike'));
    expect(lines.length).toBe(1);
    expect(lines[0]).toContain('hits');
    expect(lines[0]).toContain('and is healed for 2');
  });
});
