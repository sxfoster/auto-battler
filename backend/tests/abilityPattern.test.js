const GameEngine = require('../game/engine');
const { createCombatant } = require('../game/utils');

describe('Additional ability effect patterns', () => {
  test('generic heal targets ally', () => {
    const healer = createCombatant({ hero_id: 1 }, 'player', 0);
    const ally = createCombatant({ hero_id: 2 }, 'player', 1);
    const engine = new GameEngine([healer, ally]);
    const caster = engine.combatants.find(c => c.id === healer.id);
    const target = engine.combatants.find(c => c.id === ally.id);
    target.currentHp -= 5;
    const ability = { name: 'Holy Light', effect: 'Heal an ally for 5 HP.' };

    engine.applyAbilityEffect(caster, target, ability);

    const updated = engine.combatants.find(c => c.id === target.id);
    expect(updated.currentHp).toBe(updated.maxHp);
    expect(engine.battleLog.some(l => l.message.includes('heals') && l.message.includes('5'))).toBe(true);
  });

  test('area damage hits all enemies', () => {
    const caster = createCombatant({ hero_id: 1 }, 'player', 0);
    const enemy1 = createCombatant({ hero_id: 2001 }, 'enemy', 0);
    const enemy2 = createCombatant({ hero_id: 2001 }, 'enemy', 1);
    const engine = new GameEngine([caster, enemy1, enemy2]);
    const ability = { name: 'Fire Nova', effect: 'Deal 3 damage to all enemies.' };

    engine.applyAbilityEffect(caster, enemy1, ability);

    const e1 = engine.combatants.find(c => c.id === enemy1.id);
    const e2 = engine.combatants.find(c => c.id === enemy2.id);
    expect(e1.currentHp).toBe(enemy1.maxHp - 3);
    expect(e2.currentHp).toBe(enemy2.maxHp - 3);
    expect(engine.battleLog.some(l => l.message.includes('all enemies') && l.message.includes('3'))).toBe(true);
  });

  test('confuse text applies status effect', () => {
    const caster = createCombatant({ hero_id: 6 }, 'player', 0);
    const target = createCombatant({ hero_id: 1 }, 'enemy', 0);
    const engine = new GameEngine([caster, target]);
    const ability = { name: 'Illusionary Strike', effect: 'Deal 1 damage and confuse the target.' };

    engine.applyAbilityEffect(caster, target, ability);

    const updated = engine.combatants.find(c => c.id === target.id);
    const confuse = updated.statusEffects.find(s => s.name === 'Confuse');
    expect(confuse).toBeTruthy();
    expect(confuse.turnsRemaining).toBe(1);
    expect(engine.battleLog.some(l => l.message.includes('confused'))).toBe(true);
  });

  test('defense down pattern applies status with turns', () => {
    const caster = createCombatant({ hero_id: 1 }, 'player', 0);
    const target = createCombatant({ hero_id: 1 }, 'enemy', 0);
    const engine = new GameEngine([caster, target]);
    const ability = { name: 'Armor Crack', effect: 'Apply Defense Down for 2 turns.' };

    engine.applyAbilityEffect(caster, target, ability);

    const updated = engine.combatants.find(c => c.id === target.id);
    const dd = updated.statusEffects.find(s => s.name === 'Defense Down');
    expect(dd).toBeTruthy();
    expect(dd.turnsRemaining).toBe(2);
    expect(engine.battleLog.some(l => l.message.includes('Defense Down'))).toBe(true);
  });
});
