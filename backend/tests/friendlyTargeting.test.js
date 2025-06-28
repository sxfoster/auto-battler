const GameEngine = require('../game/engine');
const { createCombatant } = require('../game/utils');

describe('Friendly ability targeting', () => {
  test('Divine Light heals the caster', () => {
    const cleric = createCombatant({ hero_id: 4, ability_id: 3511 }, 'enemy', 0);
    const player = createCombatant({ hero_id: 1 }, 'player', 0);
    cleric.currentHp -= 3;
    cleric.currentEnergy = 2;
    cleric.speed = 10;
    const engine = new GameEngine([cleric, player]);
    engine.startRound();
    engine.processTurn();
    const updated = engine.combatants.find(c => c.id === cleric.id);
    expect(updated.currentHp).toBe(updated.maxHp);
    expect(engine.battleLog.some(l => l.includes('uses Divine Light'))).toBe(true);
    expect(engine.battleLog.some(l => l.includes('heals'))).toBe(true);
  });

  test('Regrowth heals the caster', () => {
    const druid = createCombatant({ hero_id: 5, ability_id: 3612 }, 'enemy', 0);
    const player = createCombatant({ hero_id: 1 }, 'player', 0);
    druid.currentHp -= 2;
    druid.currentEnergy = 2;
    druid.speed = 10;
    const engine = new GameEngine([druid, player]);
    engine.startRound();
    engine.processTurn();
    const updated = engine.combatants.find(c => c.id === druid.id);
    expect(updated.currentHp).toBe(updated.maxHp);
    expect(engine.battleLog.some(l => l.includes('uses Regrowth'))).toBe(true);
    expect(engine.battleLog.some(l => l.includes('heals'))).toBe(true);
  });

  test('lack of energy causes cleric to attack the enemy', () => {
    const cleric = createCombatant({ hero_id: 4, ability_id: 3511 }, 'enemy', 0);
    const player = createCombatant({ hero_id: 1 }, 'player', 0);
    cleric.currentEnergy = 0; // not enough for Divine Light
    cleric.speed = 10;
    const engine = new GameEngine([cleric, player]);
    engine.startRound();
    engine.processTurn();
    const updatedPlayer = engine.combatants.find(c => c.id === player.id);
    const updatedCleric = engine.combatants.find(c => c.id === cleric.id);
    expect(updatedPlayer.currentHp).toBe(player.maxHp - cleric.attack);
    expect(updatedCleric.currentHp).toBe(cleric.maxHp);
  });
});
