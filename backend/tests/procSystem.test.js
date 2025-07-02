const GameEngine = require('../game/engine');
const { createCombatant } = require('../game/utils');

describe('Data-Driven Proc System', () => {
  test('Cleave proc deals damage to adjacent enemies', () => {
    const attacker = createCombatant({ hero_id: 1, weapon_id: 1102 }, 'player', 0); // Iron Sword
    const target1 = createCombatant({ hero_id: 2001 }, 'enemy', 0);
    const target2 = createCombatant({ hero_id: 2001 }, 'enemy', 1);
    const engine = new GameEngine([attacker, target1, target2]);
    engine.turnQueue = [engine.combatants.find(c => c.id === attacker.id)];

    const initialHp = target2.currentHp;
    engine.processTurn();

    const updatedTarget2 = engine.combatants.find(c => c.id === target2.id);
    expect(updatedTarget2.currentHp).toBe(initialHp - 1); // Cleave value is 1
    expect(engine.battleLog.some(l => l.message.includes('cleave procs!'))).toBe(true);
  });

  test('Thorns proc reflects damage on hit', () => {
    const defender = createCombatant({ hero_id: 1, armor_id: 2203 }, 'player', 0); // Vanguard Mail
    const attacker = createCombatant({ hero_id: 2001 }, 'enemy', 0);
    const engine = new GameEngine([attacker, defender]);
    engine.turnQueue = [engine.combatants.find(c => c.id === attacker.id)];

    const initialAttackerHp = attacker.currentHp;
    engine.processTurn();

    const updatedAttacker = engine.combatants.find(c => c.id === attacker.id);
    expect(updatedAttacker.currentHp).toBe(initialAttackerHp - 1);
    expect(engine.battleLog.some(l => l.message.includes('reflect_damage procs!'))).toBe(true);
  });

  test('Immune to Stun proc prevents stun status', () => {
    const defender = createCombatant({ hero_id: 1, armor_id: 2303 }, 'player', 0); // Juggernaut Armor
    const attacker = createCombatant({ hero_id: 1 }, 'enemy', 0);
    const engine = new GameEngine([attacker, defender]);
    
    engine.applyStatusEffect(defender, 'Stun', 1);

    expect(defender.statusEffects.some(s => s.name === 'Stun')).toBe(false);
    expect(engine.battleLog.some(l => l.message.includes('immune_to_status procs!'))).toBe(true);
  });

  test('Bonus damage proc triggers on low HP target', () => {
    const attacker = createCombatant({ hero_id: 1, weapon_id: 1203 }, 'player', 0); // Great Axe
    const defender = createCombatant({ hero_id: 2001 }, 'enemy', 0);
    defender.currentHp = defender.maxHp * 0.4; // Set HP below 50%
    const engine = new GameEngine([attacker, defender]);
    engine.turnQueue = [engine.combatants.find(c => c.id === attacker.id)];

    const initialDefenderHp = defender.currentHp;
    const baseDamage = attacker.attack - defender.defense;
    engine.processTurn();
    
    const updatedDefender = engine.combatants.find(c => c.id === defender.id);
    expect(updatedDefender.currentHp).toBe(initialDefenderHp - (baseDamage + 2));
  });
});
