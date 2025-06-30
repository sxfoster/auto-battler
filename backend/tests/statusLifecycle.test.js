const GameEngine = require('../game/engine');
const { createCombatant } = require('../game/utils');

describe('Status effect lifecycle', () => {
  test('Regrowth heals each turn and expires', () => {
    const druid = createCombatant({ hero_id: 5, ability_id: 3612 }, 'player', 0);
    const engine = new GameEngine([druid]);
    druid.currentHp -= 6;
    const ability = druid.abilityData;

    engine.applyAbilityEffect(druid, druid, ability);
    expect(druid.statusEffects.some(s => s.name === 'Regrowth')).toBe(true);

    for (let i = 0; i < 3; i++) {
      engine.processStatuses(druid);
    }

    const healLogs = engine.battleLog.filter(l => l.message.includes('healed for 2 by Regrowth'));
    expect(healLogs).toHaveLength(3);
    expect(druid.currentHp).toBe(druid.maxHp);
    expect(druid.statusEffects.length).toBe(0);
    expect(engine.battleLog.some(l => l.message.includes('Regrowth on') && l.message.includes('worn off'))).toBe(true);
  });

  test('Poison deals damage and logs each turn', () => {
    const caster = createCombatant({ hero_id: 1 }, 'player', 0);
    const target = createCombatant({ hero_id: 1 }, 'enemy', 0);
    const engine = new GameEngine([caster, target]);
    const ability = { name: 'Poison Dart', effect: 'apply Poison (1 dmg/turn for 2 turns)' };

    engine.applyAbilityEffect(caster, target, ability);
    expect(target.statusEffects.some(s => s.name === 'Poison')).toBe(true);

    for (let i = 0; i < 2; i++) {
      engine.processStatuses(target);
    }

    const poisonLogs = engine.battleLog.filter(l => l.message.includes('poison damage'));
    expect(poisonLogs).toHaveLength(2);
    expect(target.currentHp).toBe(target.maxHp - 2);
    expect(target.statusEffects.length).toBe(0);
    expect(engine.battleLog.some(l => l.message.includes('Poison on') && l.message.includes('worn off'))).toBe(true);
  });
});
