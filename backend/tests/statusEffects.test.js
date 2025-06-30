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
    engine.processTurn(); // enemy attacks

    let caster = engine.combatants.find(c => c.id === druid.id);
    expect(caster.statusEffects.some(s => s.name === 'Regrowth')).toBe(true);
    const enemyAtk = enemy.attack;
    expect(caster.currentHp).toBe(druid.maxHp - 4 - enemyAtk);

    // next round - first tick
    engine.startRound();
    engine.processTurn(); // druid
    caster = engine.combatants.find(c => c.id === druid.id);
    expect(caster.currentHp).toBe(druid.maxHp - 4 - enemyAtk + 2);
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

  test('Illusionary Strike confusion causes some attacks to miss', () => {
    const attacker = createCombatant({ hero_id: 6, ability_id: 4004 }, 'player', 0);
    const target = createCombatant({ hero_id: 1 }, 'enemy', 0);
    const engine = new GameEngine([attacker, target]);
    const a = engine.combatants.find(c => c.id === attacker.id);
    const t = engine.combatants.find(c => c.id === target.id);
    const spy = jest.spyOn(Math, 'random');

    // first application - will miss
    engine.applyAbilityEffect(a, t, a.abilityData);
    expect(t.statusEffects.some(s => s.name === 'Confuse')).toBe(true);
    spy.mockReturnValueOnce(0.4);
    let skipped = engine.processStatuses(t);
    expect(skipped).toBe(true);
    expect(engine.battleLog.some(l => l.message.includes('fumbles'))).toBe(true);

    // reapply and this time attack should go through
    engine.applyAbilityEffect(a, t, a.abilityData);
    spy.mockReturnValueOnce(0.6);
    skipped = engine.processStatuses(t);
    expect(skipped).toBe(false);
    spy.mockRestore();
  });

  test('Armor Break increases damage while active', () => {
    const attacker = createCombatant({ hero_id: 1 }, 'player', 0);
    const target = createCombatant({ hero_id: 1 }, 'enemy', 0);
    const engine = new GameEngine([attacker, target]);
    const a = engine.combatants.find(c => c.id === attacker.id);
    const t = engine.combatants.find(c => c.id === target.id);
    const ability = { name: 'Armor Break', effect: 'Deal 1 damage and apply Armor Break +1 damage for 2 turns' };

    engine.applyAbilityEffect(a, t, ability);
    expect(t.currentHp).toBe(target.maxHp - 1);
    expect(t.statusEffects.some(s => s.name === 'Armor Break')).toBe(true);

    engine.applyDamage(a, t, a.attack);
    expect(t.currentHp).toBe(target.maxHp - 1 - a.attack - 1);

    engine.processStatuses(t);
    engine.applyDamage(a, t, a.attack);
    expect(t.currentHp).toBe(target.maxHp - 1 - (a.attack + 1) - (a.attack + 1));

    engine.processStatuses(t); // Armor Break expires
    engine.applyDamage(a, t, a.attack);
    expect(t.currentHp).toBe(target.maxHp - 1 - 2*(a.attack + 1) - a.attack);
  });
});
