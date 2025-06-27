jest.mock('../../discord-bot/src/utils/abilityCardService', () => ({
  decrementCharge: jest.fn()
}));
const abilityCardService = require('../../discord-bot/src/utils/abilityCardService');
const GameEngine = require('../game/engine');
const { createCombatant } = require('../game/utils');

describe('Ability card charges', () => {
  beforeEach(() => {
    abilityCardService.decrementCharge.mockClear();
  });

  test('decrementCharge is called when ability card is used', () => {
    const card = { id: 99, ability_id: 3111, charges: 2 };
    const player = createCombatant({ hero_id: 1, ability_id: 3111, ability_card: card }, 'player', 0);
    const enemy = createCombatant({ hero_id: 2001 }, 'enemy', 0);
    const engine = new GameEngine([player, enemy]);

    // Build energy and use ability
    engine.startRound();
    engine.processTurn(); // player
    engine.processTurn(); // enemy
    engine.startRound();
    engine.processTurn(); // player
    engine.processTurn(); // enemy
    engine.startRound();
    engine.processTurn(); // player uses ability

    expect(abilityCardService.decrementCharge).toHaveBeenCalledWith(card.id);
    const updated = engine.combatants.find(c => c.team === 'player');
    expect(updated.abilityCharges).toBe(card.charges - 1);
  });
});
