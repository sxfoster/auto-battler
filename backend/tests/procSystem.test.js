const GameEngine = require('../game/engine');
const { createCombatant } = require('../game/utils');
const { allPossibleWeapons } = require('../game/data');

describe('Weapon proc system', () => {
  const weaponsWithProc = allPossibleWeapons.filter(
    w => (w.procs && w.procs.length) || w.passiveEffect
  );
  weaponsWithProc.forEach(weapon => {
    const proc = weapon.procs ? weapon.procs[0] : weapon.passiveEffect;
    test(`${weapon.name} applies ${proc.effect}`, () => {
      const attacker = createCombatant({ hero_id: 1, weapon_id: weapon.id }, 'player', 0);
      const target = createCombatant({ hero_id: 1 }, 'enemy', 0);
      const engine = new GameEngine([attacker, target]);
      engine.turnQueue = engine.computeTurnQueue();
      jest.spyOn(Math, 'random').mockReturnValueOnce(0); // ensure proc triggers
      engine.processTurn();
      const updated = engine.combatants.find(c => c.id === target.id);
      expect(updated.statusEffects.some(e => e.name === proc.effect)).toBe(true);
    });
  });
});
