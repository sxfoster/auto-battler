const GameEngine = require('../game/engine');
const { createCombatant } = require('../game/utils');

describe('Equipment bonuses and passives', () => {
  test('stat bonuses are applied from equipment', () => {
    const combatant = createCombatant({ hero_id: 1, weapon_id: 1302, armor_id: 2302 }, 'player', 0);
    // Base stats: attack 3, speed 3, defense 2, hp 22
    expect(combatant.attack).toBe(3 + 2);
    expect(combatant.speed).toBe(3 + 4 - 1);
    // Hero class grants 2 defense plus armor bonus
    expect(combatant.defense).toBe(2 + 4);
    expect(combatant.maxHp).toBe(22);
  });

  test('weapon passive effect triggers on auto attack', () => {
    const attacker = createCombatant({ hero_id: 1, weapon_id: 1302 }, 'player', 0);
    const target = createCombatant({ hero_id: 1 }, 'enemy', 0);
    const engine = new GameEngine([attacker, target]);
    engine.turnQueue = engine.computeTurnQueue();
    jest.spyOn(Math, 'random').mockReturnValueOnce(0.1); // trigger proc
    engine.processTurn();
    const updated = engine.combatants.find(c => c.id === target.id);
    expect(updated.statusEffects.some(e => e.name === 'Poison')).toBe(true);
  });
});
