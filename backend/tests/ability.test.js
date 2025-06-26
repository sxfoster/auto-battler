const GameEngine = require('../game/engine');
const { createCombatant } = require('../game/utils');
const { allPossibleAbilities } = require('../game/data');

describe('Ability effects', () => {
  test('Arcane Explosion damages all enemies', () => {
    const arcaneExplosion = allPossibleAbilities.find(a => a.name === 'Arcane Explosion');
    const attacker = createCombatant({ hero_id: 401, weapon_id: null, armor_id: null, ability_id: null, deck: [arcaneExplosion.id] }, 'player', 0);
    attacker.currentEnergy = arcaneExplosion.energyCost;

    const enemy1 = createCombatant({ hero_id: 2502, weapon_id: null, armor_id: null, ability_id: null }, 'enemy', 0);
    const enemy2 = createCombatant({ hero_id: 2502, weapon_id: null, armor_id: null, ability_id: null }, 'enemy', 1);

    const engine = new GameEngine([attacker, enemy1, enemy2]);
    engine.turnQueue = engine.computeTurnQueue();
    engine.processTurn();

    const e1 = engine.combatants.find(c => c.id === enemy1.id);
    const e2 = engine.combatants.find(c => c.id === enemy2.id);
    expect(e1.currentHp).toBe(enemy1.maxHp - 2);
    expect(e2.currentHp).toBe(enemy2.maxHp - 2);
  });

  test('Raise Skeleton summons a minion', () => {
    const raiseSkeleton = allPossibleAbilities.find(a => a.name === 'Raise Skeleton');
    const necro = createCombatant({ hero_id: 2502, weapon_id: null, armor_id: null, ability_id: null, deck: [raiseSkeleton.id] }, 'player', 0);
    necro.currentEnergy = raiseSkeleton.energyCost;

    const foe = createCombatant({ hero_id: 2001, weapon_id: null, armor_id: null, ability_id: null }, 'enemy', 0);

    const engine = new GameEngine([necro, foe]);
    engine.turnQueue = engine.computeTurnQueue();
    engine.processTurn();

    const minions = engine.combatants.filter(c => c.isMinion);
    expect(minions.length).toBe(1);
    expect(minions[0].heroData.name).toBe('Skeleton');
  });
});
