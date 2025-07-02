const GameEngine = require('../game/engine');
const { createCombatant } = require('../game/utils');
const { allPossibleWeapons, allPossibleArmors } = require('../game/data');

describe('Proc system', () => {
  test('Iron Sword cleave damages secondary target', () => {
    const sword = allPossibleWeapons.find(w => w.id === 1102);
    const attacker = createCombatant({ hero_id: 1, weapon_id: sword.id }, 'player', 0);
    const target1 = createCombatant({ hero_id: 1 }, 'enemy', 0);
    const target2 = createCombatant({ hero_id: 1 }, 'enemy', 1);
    const engine = new GameEngine([attacker, target1, target2]);
    engine.turnQueue = engine.computeTurnQueue();
    engine.processTurn();
    expect(engine.combatants[2].currentHp).toBeLessThan(engine.combatants[2].maxHp);
  });

  test('Bandit Dirk applies poison', () => {
    const weapon = allPossibleWeapons.find(w => w.id === 1302);
    const attacker = createCombatant({ hero_id: 1, weapon_id: weapon.id }, 'player', 0);
    const target = createCombatant({ hero_id: 1 }, 'enemy', 0);
    const engine = new GameEngine([attacker, target]);
    engine.turnQueue = engine.computeTurnQueue();
    jest.spyOn(Math, 'random').mockReturnValueOnce(0); // trigger proc
    engine.processTurn();
    const updated = engine.combatants.find(c => c.id === target.id);
    expect(updated.statusEffects.some(e => e.name === 'Poison')).toBe(true);
  });

  test('Vanguard Mail reflects damage', () => {
    const armor = allPossibleArmors.find(a => a.id === 2203);
    const attacker = createCombatant({ hero_id: 1 }, 'player', 0);
    const defender = createCombatant({ hero_id: 1, armor_id: armor.id }, 'enemy', 0);
    const engine = new GameEngine([attacker, defender]);
    engine.turnQueue = engine.computeTurnQueue();
    const initial = attacker.currentHp;
    engine.processTurn();
    expect(engine.combatants[0].currentHp).toBeLessThan(initial);
  });

  test('Juggernaut Armor grants stun immunity', () => {
    const armor = allPossibleArmors.find(a => a.id === 2303);
    const target = createCombatant({ hero_id: 1, armor_id: armor.id }, 'player', 0);
    const engine = new GameEngine([target]);
    engine.applyStatusEffect(target, 'Stun', 1);
    expect(target.statusEffects.some(s => s.name === 'Stun')).toBe(false);
  });
});
