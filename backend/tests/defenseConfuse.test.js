const GameEngine = require('../game/engine');
const { createCombatant } = require('../game/utils');

describe('Defense and Confuse mechanics', () => {
  test('block reduces incoming damage', () => {
    const attacker = createCombatant({ hero_id: 1 }, 'player', 0);
    const defender = createCombatant({ hero_id: 2001, armor_id: 2202 }, 'enemy', 0);
    const engine = new GameEngine([attacker, defender]);
    engine.turnQueue = engine.computeTurnQueue();
    engine.processTurn();
    const updated = engine.combatants.find(c => c.id === defender.id);
    const dmg = Math.max(1, attacker.attack - defender.block);
    expect(updated.currentHp).toBe(defender.maxHp - dmg);
  });

  test('Defense Down lowers block', () => {
    const attacker = createCombatant({ hero_id: 1 }, 'player', 0);
    const defender = createCombatant({ hero_id: 2001, armor_id: 2202 }, 'enemy', 0);
    defender.statusEffects.push({ name: 'Defense Down', turnsRemaining: 1 });
    const engine = new GameEngine([attacker, defender]);
    engine.turnQueue = engine.computeTurnQueue();
    engine.processTurn(); // attacker hits
    let updated = engine.combatants.find(c => c.id === defender.id);
    const dmg = Math.max(1, attacker.attack - Math.max(0, defender.block - 1));
    expect(updated.currentHp).toBe(defender.maxHp - dmg);
    engine.processTurn(); // defender turn cleans up
    updated = engine.combatants.find(c => c.id === defender.id);
    expect(updated.statusEffects.length).toBe(0);
  });

  test('Confuse can cause a miss', () => {
    const attacker = createCombatant({ hero_id: 1 }, 'player', 0);
    const defender = createCombatant({ hero_id: 2001 }, 'enemy', 0);
    attacker.statusEffects.push({ name: 'Confuse', turnsRemaining: 1 });
    const engine = new GameEngine([attacker, defender]);
    engine.turnQueue = engine.computeTurnQueue();
    jest.spyOn(Math, 'random').mockReturnValueOnce(0.3);
    engine.processTurn();
    Math.random.mockRestore();
    const def = engine.combatants.find(c => c.id === defender.id);
    expect(def.currentHp).toBe(defender.maxHp);
    const att = engine.combatants.find(c => c.id === attacker.id);
    expect(att.statusEffects.length).toBe(0);
    expect(engine.battleLog.some(l => l.message.includes('misses'))).toBe(true);
  });
});
