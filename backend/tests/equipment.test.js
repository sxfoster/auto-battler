const GameEngine = require('../game/engine');
const { createCombatant } = require('../game/utils');
const { allPossibleWeapons } = require('../game/data');

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

  test('weapon proc applies poison on hit', () => {
    const weapon = allPossibleWeapons.find(w => w.id === 1302);
    const proc = weapon.procs[0];
    expect(proc.effect).toBe('apply_status');

    const attacker = createCombatant({ hero_id: 1, weapon_id: 1302 }, 'player', 0);
    const target = createCombatant({ hero_id: 1 }, 'enemy', 0);
    const engine = new GameEngine([attacker, target]);
    engine.turnQueue = engine.computeTurnQueue();
    jest.spyOn(Math, 'random').mockReturnValueOnce(0.1); // trigger proc
    engine.processTurn();
    const updated = engine.combatants.find(c => c.id === target.id);
    expect(updated.statusEffects.some(e => e.name === proc.status)).toBe(true);
  });
});
