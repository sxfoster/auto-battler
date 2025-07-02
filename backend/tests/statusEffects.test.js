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

  test('Illusionary Strike confusion can cause misses', () => {
    const player = createCombatant({ hero_id: 1 }, 'player', 0);
    const enemy = createCombatant({ hero_id: 1 }, 'enemy', 0);
    const engine = new GameEngine([player, enemy]);
    const ability = { name: 'Illusionary Strike', effect: 'Deal 2 damage and confuse the target (50% chance they miss their next action).' };

    engine.applyAbilityEffect(player, enemy, ability);
    const p = engine.combatants.find(c => c.id === player.id);
    const e = engine.combatants.find(c => c.id === enemy.id);
    expect(e.statusEffects.some(s => s.name === 'Confuse')).toBe(true);

    jest.spyOn(Math, 'random').mockReturnValueOnce(0.3);
    engine.turnQueue = [e];
    const before = p.currentHp;
    engine.processTurn();
    const updatedP = engine.combatants.find(c => c.id === p.id);
    expect(updatedP.currentHp).toBe(before);
    expect(engine.battleLog.some(l => l.message.includes('attack misses'))).toBe(true);

    engine.applyAbilityEffect(p, e, ability);
    expect(e.statusEffects.some(s => s.name === 'Confuse')).toBe(true);
    jest.spyOn(Math, 'random').mockReturnValueOnce(0.7);
    engine.turnQueue = [e];
    const before2 = updatedP.currentHp;
    engine.processTurn();
    const updatedP2 = engine.combatants.find(c => c.id === p.id);
    const expectedDamage = Math.max(1, e.attack - p.defense);
    expect(updatedP2.currentHp).toBe(before2 - expectedDamage);
  });

  test('Armor Break increases damage while active', () => {
    const attacker = createCombatant({ hero_id: 1 }, 'player', 0);
    const target = createCombatant({ hero_id: 1 }, 'enemy', 0);
    const engine = new GameEngine([attacker, target]);
    const atk = engine.combatants.find(c => c.id === attacker.id);
    const tgt = engine.combatants.find(c => c.id === target.id);
    const ability = { name: 'Armor Break', effect: 'Apply Armor Break for 2 turns (target takes +1 damage).' };

    engine.applyAbilityEffect(atk, tgt, ability);
    expect(tgt.statusEffects.some(s => s.name === 'Armor Break')).toBe(true);

    const base = atk.attack;
    const result1 = engine.applyDamage(atk, tgt, base, { log: false });
    expect(result1.finalDamage).toBe(base - tgt.defense + 1);

    engine.processStatuses(tgt);
    const result2 = engine.applyDamage(atk, tgt, base, { log: false });
    expect(result2.finalDamage).toBe(base - tgt.defense + 1);

    engine.processStatuses(tgt);
    const result3 = engine.applyDamage(atk, tgt, base, { log: false });
    expect(result3.finalDamage).toBe(base - tgt.defense);
  });
});
