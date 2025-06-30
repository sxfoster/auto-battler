const GameEngine = require('../game/engine');
const { createCombatant } = require('../game/utils');

describe('Auto attack combat', () => {
  test('attacker deals damage equal to its attack stat', () => {
    const attacker = createCombatant({ hero_id: 1, weapon_id: null, armor_id: null }, 'player', 0);
    const defender = createCombatant({ hero_id: 2001, weapon_id: null, armor_id: null }, 'enemy', 0);

    const engine = new GameEngine([attacker, defender]);
    engine.turnQueue = engine.computeTurnQueue();
    engine.processTurn();

    const target = engine.combatants.find(c => c.id === defender.id);
    expect(target.currentHp).toBe(defender.maxHp - attacker.attack);
  });

  test('defense reduces incoming damage', () => {
    const attacker = createCombatant({ hero_id: 2 }, 'player', 0); // attack 2
    const defender = createCombatant({ hero_id: 1 }, 'enemy', 0); // defense 2

    const engine = new GameEngine([attacker, defender]);
    engine.turnQueue = engine.computeTurnQueue();
    engine.processTurn();

    const target = engine.combatants.find(c => c.id === defender.id);
    expect(target.currentHp).toBe(defender.maxHp - 1);
  });
});
