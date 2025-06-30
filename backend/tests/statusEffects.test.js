const GameEngine = require('../game/engine');
const { createCombatant } = require('../game/utils');

describe('Status effect processing', () => {
  test('Regrowth heals over multiple turns', () => {
    const druid = createCombatant({ hero_id: 5, ability_id: 3612 }, 'player', 0);
    const enemy = createCombatant({ hero_id: 1 }, 'enemy', 0);
    druid.currentHp -= 4;
    druid.currentEnergy = 2;
    druid.speed = 10;
    druid.abilityCharges = 1;

    const engine = new GameEngine([druid, enemy]);

    engine.startRound();
    engine.processTurn(); // druid casts Regrowth
    engine.processTurn(); // enemy attacks

    engine.startRound();
    engine.processTurn(); // heal tick 1
    engine.processTurn(); // enemy

    engine.startRound();
    engine.processTurn(); // heal tick 2 and expire

    const logs = engine.battleLog.map(l => l.message).join('\n');
    expect(logs).toContain('uses Regrowth');
    expect(logs).toContain('heals 2 HP from Regrowth');
    expect(logs).toContain('Regrowth on Druid wears off.');
    const updated = engine.combatants.find(c => c.id === druid.id);
    expect(updated.statusEffects.length).toBe(0);
  });

  test('Poison deals damage each turn and expires', () => {
    const caster = createCombatant({ hero_id: 5 }, 'enemy', 0);
    const target = createCombatant({ hero_id: 1 }, 'player', 0);
    caster.abilityData = { name: 'Poison Bite', energyCost: 1, effect: 'Deal 1 damage and apply Poison 1 for 2 turns.' };
    caster.abilityCharges = 1;
    caster.currentEnergy = 1;
    caster.speed = 10;

    const engine = new GameEngine([target, caster]);

    engine.startRound();
    engine.processTurn(); // caster uses poison
    engine.processTurn(); // target takes poison tick 1

    engine.startRound();
    engine.processTurn(); // caster normal attack
    engine.processTurn(); // target poison tick 2

    const logs = engine.battleLog.map(l => l.message).join('\n');
    expect(logs).toContain('uses Poison Bite');
    const poisonLogs = logs.match(/suffers 1 poison damage/g) || [];
    expect(poisonLogs.length).toBe(2);
    expect(logs).toContain('Poison on Warrior wears off.');
    const updated = engine.combatants.find(c => c.id === target.id);
    expect(updated.statusEffects.length).toBe(0);
  });
});
