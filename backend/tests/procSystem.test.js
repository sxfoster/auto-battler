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
    expect(engine.battleLog.some(l => l.message.includes('procs cleave'))).toBe(true);
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
    expect(engine.battleLog.some(l => l.message.includes('reflect_damage'))).toBe(true);
  });

  test('Immune to Stun proc prevents stun status', () => {
    const defender = createCombatant({ hero_id: 1, armor_id: 2303 }, 'player', 0); // Juggernaut Armor
    const attacker = createCombatant({ hero_id: 1 }, 'enemy', 0);
    const engine = new GameEngine([attacker, defender]);
    const internalDefender = engine.combatants.find(c => c.id === defender.id);

    engine.applyStatusEffect(internalDefender, 'Stun', 1);

    expect(internalDefender.statusEffects.some(s => s.name === 'Stun')).toBe(false);
  });

  test('Permanent defense reduction proc on hit', () => {
    const attacker = createCombatant({ hero_id: 1, weapon_id: 1403 }, 'player', 0); // Sunforge Maul
    const defender = createCombatant({ hero_id: 1 }, 'enemy', 0);
    const engine = new GameEngine([attacker, defender]);
    engine.turnQueue = [engine.combatants.find(c => c.id === attacker.id)];

    const initialDefense = defender.defense;
    engine.processTurn();

    const updatedDef = engine.combatants.find(c => c.id === defender.id);
    expect(updatedDef.defense).toBe(initialDefense - 1);
  });

  test('Weapon grants extra attack on kill', () => {
    const attacker = createCombatant({ hero_id: 1, weapon_id: 1104 }, 'player', 0); // Dragonfang Blade
    const defender = createCombatant({ hero_id: 2001 }, 'enemy', 0);
    defender.currentHp = 1;
    const engine = new GameEngine([attacker, defender]);
    engine.turnQueue = [engine.combatants.find(c => c.id === attacker.id)];

    engine.processTurn();
    const internalAttacker = engine.combatants.find(c => c.id === attacker.id);
    expect(engine.turnQueue[0]).toBe(internalAttacker);
  });

  test('Apprentice Rod heals on ability use', () => {
    const attacker = createCombatant({ hero_id: 11, weapon_id: 1702, ability_id: 3111 }, 'player', 0);
    const target = createCombatant({ hero_id: 1 }, 'enemy', 0);
    attacker.currentEnergy = 2;
    const engine = new GameEngine([attacker, target]);
    const internalAttacker = engine.combatants.find(c => c.id === attacker.id);
    const internalTarget = engine.combatants.find(c => c.id === target.id);
    engine.turnQueue = [internalAttacker, internalTarget];

    internalAttacker.currentHp -= 2; // ensure heal has effect
    const hpBefore = internalAttacker.currentHp;
    engine.processTurn();
    const updated = engine.combatants.find(c => c.id === attacker.id);
    expect(updated.currentHp).toBe(hpBefore + 2);
  });

  test('Energy gain at combat start', () => {
    const c = createCombatant({ hero_id: 11, weapon_id: 1704 }, 'player', 0); // Archmage Catalyst
    const enemy = createCombatant({ hero_id: 1 }, 'enemy', 0);
    const engine = new GameEngine([c, enemy]);

    engine.runGameSteps().next();
    const updated = engine.combatants.find(u => u.id === c.id);
    expect(updated.currentEnergy).toBe(1);
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

  test('Ignore block proc bypasses some defense', () => {
    const attacker = createCombatant({ hero_id: 1, weapon_id: 1202 }, 'player', 0); // Battle Axe
    const defender = createCombatant({ hero_id: 1 }, 'enemy', 0);
    const engine = new GameEngine([attacker, defender]);
    engine.turnQueue = [engine.combatants.find(c => c.id === attacker.id)];

    const base = attacker.attack - defender.defense;
    engine.processTurn();
    const updated = engine.combatants.find(c => c.id === defender.id);
    expect(updated.currentHp).toBe(defender.maxHp - (base + 1));
  });

  test('Captain\'s Bulwark grants ally defense on combat start', () => {
    const bulwark = createCombatant({ hero_id: 1, armor_id: 2204 }, 'player', 0);
    const ally = createCombatant({ hero_id: 1 }, 'player', 1);
    const enemy = createCombatant({ hero_id: 1 }, 'enemy', 0);
    const engine = new GameEngine([bulwark, ally, enemy]);

    engine.runGameSteps().next();
    const allyInternal = engine.combatants.find(c => c.id === ally.id);
    expect(allyInternal.defense).toBe(ally.defense + 1);
  });

  test('Arcane Shielding blocks targeted ability', () => {
    const defender = createCombatant({ hero_id: 1, armor_id: 2402 }, 'player', 0); // Arcane Shielding
    const attacker = createCombatant({ hero_id: 1, ability_id: 3111 }, 'enemy', 0);
    attacker.currentEnergy = 2;
    const engine = new GameEngine([attacker, defender]);
    const atk = engine.combatants.find(c => c.id === attacker.id);
    const def = engine.combatants.find(c => c.id === defender.id);
    engine.turnQueue = [atk];

    const hpBefore = def.currentHp;
    const base = attacker.attack - def.defense;
    const expected = hpBefore - Math.max(1, base);
    engine.processTurn();
    const after = engine.combatants.find(c => c.id === defender.id);
    expect(after.currentHp).toBe(expected);
  });
});
