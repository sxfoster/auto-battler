const GameEngine = require('../game/engine');
const { createCombatant } = require('../game/utils');

describe('Status effect processing', () => {
  test('Regrowth heals over multiple turns', () => {
    const druid = createCombatant({ hero_id: 5, ability_id: 3612 }, 'player', 0);
    const enemy = createCombatant({ hero_id: 1 }, 'enemy', 0);
    druid.currentHp -= 4;
    druid.currentEnergy = 2;
    druid.speed = 10;

    const engine = new GameEngine([druid, enemy]);

    engine.startRound();
    engine.processTurn(); // druid casts Regrowth
    engine.processTurn(); // enemy

    let caster = engine.combatants.find(c => c.id === druid.id);
    expect(caster.statusEffects.some(s => s.name === 'Regrowth')).toBe(true);

    // next round - first tick
    engine.startRound();
    engine.processTurn(); // druid
    caster = engine.combatants.find(c => c.id === druid.id);
    const enemyAtk = enemy.attack;
    expect(caster.currentHp).toBe(druid.maxHp - 4 + 2 - enemyAtk + 2);
    expect(engine.battleLog.some(l => l.message.includes('healed for 2 by Regrowth'))).toBe(true);
  });

  test('Poison deals damage each turn', () => {
    const caster = createCombatant({ hero_id: 1 }, 'player', 0);
    const target = createCombatant({ hero_id: 1 }, 'enemy', 0);
    const engine = new GameEngine([caster, target]);
    const c = engine.combatants.find(c => c.id === caster.id);
    const t = engine.combatants.find(c => c.id === target.id);
    const ability = { name: 'Poison Dart', effect: 'apply Poison (1 dmg/turn for 2 turns)' };

    engine.applyAbilityEffect(c, t, ability);
    expect(t.statusEffects.some(s => s.name === 'Poison')).toBe(true);

    engine.processStatuses(t);
    expect(t.currentHp).toBe(target.maxHp - 1);

    engine.processStatuses(t);
    expect(t.currentHp).toBe(target.maxHp - 2);
    expect(t.statusEffects.length).toBe(0);
    expect(engine.battleLog.some(l => l.message.includes('poison damage'))).toBe(true);
  });
});
