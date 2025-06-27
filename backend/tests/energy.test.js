const GameEngine = require('../game/engine');
const { createCombatant } = require('../game/utils');

describe('Energy and charge system', () => {
  test('abilities consume energy and charges', () => {
    const player = createCombatant({ hero_id: 1, deck: [3111, 3111] }, 'player', 0);
    const enemy = createCombatant({ hero_id: 2001 }, 'enemy', 0);
    // start with only 1 charge on active ability to force swap
    player.abilityCharges = 1;

    const engine = new GameEngine([player, enemy]);
    engine.turnQueue = engine.computeTurnQueue();
    engine.processTurn();
    const combatant = engine.combatants.find(c => c.team === 'player');

    expect(combatant.currentEnergy).toBe(0); // spent 1 energy
    expect(combatant.abilityData.name).toBe('Power Strike');
    // Should swap to second copy with full charges
    expect(combatant.abilityCharges).toBe(10);
    expect(combatant.deck.length).toBe(0);
  });

  test('energy builds when insufficient to use ability', () => {
    const player = createCombatant({ hero_id: 1, deck: [3111] }, 'player', 0);
    const enemy = createCombatant({ hero_id: 2001 }, 'enemy', 0);
    // make ability cost high
    player.abilityData.energyCost = 3;
    player.abilityCharges = 1;

    const engine = new GameEngine([player, enemy]);
    engine.turnQueue = engine.computeTurnQueue();
    engine.processTurn();
    const combatant = engine.combatants.find(c => c.team === 'player');

    // not enough energy to cast, so energy should accumulate
    expect(combatant.currentEnergy).toBe(1);
    expect(combatant.abilityCharges).toBe(1);
  });
});
