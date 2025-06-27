const GameEngine = require('../game/engine');
const { createCombatant } = require('../game/utils');
const abilityCardService = require('../game/abilityCardService');
const { allPossibleAbilities } = require('../game/data');

describe('Auto attack combat', () => {
  afterEach(() => {
    abilityCardService.inventories = new Map();
  });
  test('attacker deals damage equal to its attack stat', () => {
    const attacker = createCombatant({ hero_id: 1, weapon_id: null, armor_id: null }, 'player', 0);
    const defender = createCombatant({ hero_id: 2001, weapon_id: null, armor_id: null }, 'enemy', 0);

    const engine = new GameEngine([attacker, defender]);
    engine.turnQueue = engine.computeTurnQueue();
    engine.processTurn();

    const target = engine.combatants.find(c => c.id === defender.id);
    expect(target.currentHp).toBe(defender.maxHp - attacker.attack);
  });

  test('ability energy and charge usage', () => {
    const ability = allPossibleAbilities.find(a => a.name === 'Power Strike');
    const attacker = createCombatant({
      hero_id: 1,
      weapon_id: null,
      armor_id: null,
      ability_id: ability.id,
      ability_cards: [
        { id: 'c1', abilityId: ability.id, charges: 1 },
        { id: 'c2', abilityId: ability.id, charges: 1 }
      ]
    }, 'player', 0);
    const defender = createCombatant({ hero_id: 2001, weapon_id: null, armor_id: null }, 'enemy', 0);

    abilityCardService.setInventory(attacker.id, attacker.abilityCards);
    attacker.equippedCardId = attacker.abilityCards[0].id;

    const engine = new GameEngine([attacker, defender]);

    const takeTurn = () => {
      engine.turnQueue = engine.computeTurnQueue();
      engine.processTurn();
    };

    // Turn 1: basic attack, gain energy
    takeTurn();
    let stateDef = engine.combatants.find(c => c.id === defender.id);
    expect(stateDef.currentHp).toBe(defender.maxHp - attacker.attack);
    expect(engine.combatants.find(c => c.id === attacker.id).currentEnergy).toBe(1);

    // Turn 2: uses first card
    takeTurn();
    stateDef = engine.combatants.find(c => c.id === defender.id);
    let stateAtt = engine.combatants.find(c => c.id === attacker.id);
    expect(stateDef.currentHp).toBe(defender.maxHp - attacker.attack - 2);
    expect(attacker.abilityCards[0].charges).toBe(0);
    stateAtt = engine.combatants.find(c => c.id === attacker.id);
    expect(stateAtt.equippedCardId).toBe(attacker.abilityCards[1].id);
    expect(stateAtt.currentEnergy).toBe(1);

    // Turn 3: uses second card
    takeTurn();
    stateDef = engine.combatants.find(c => c.id === defender.id);
    stateAtt = engine.combatants.find(c => c.id === attacker.id);
    expect(stateDef.currentHp).toBe(defender.maxHp - attacker.attack - 2 - 2);
    expect(attacker.abilityCards[1].charges).toBe(0);
    stateAtt = engine.combatants.find(c => c.id === attacker.id);
    expect(stateAtt.currentEnergy).toBe(1);

    // Turn 4: no charges remain, basic attack
    takeTurn();
    stateDef = engine.combatants.find(c => c.id === defender.id);
    stateAtt = engine.combatants.find(c => c.id === attacker.id);
    expect(stateDef.currentHp).toBe(defender.maxHp - attacker.attack - 2 - 2 - attacker.attack);
    expect(stateAtt.currentEnergy).toBe(2);
  });
});
