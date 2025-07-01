const practice = require('../src/commands/practice');

jest.mock('../src/utils/userService', () => ({
  getUser: jest.fn(),
  createUser: jest.fn()
}));
jest.mock('../src/utils/abilityCardService', () => ({
  getCards: jest.fn()
}));
jest.mock('../../backend/game/engine');

const userService = require('../src/utils/userService');
const abilityCardService = require('../src/utils/abilityCardService');
const GameEngine = require('../../backend/game/engine');
const utils = require('../../backend/game/utils');
const gameData = require('../util/gameData');
const { allPossibleHeroes, allPossibleAbilities } = require('../../backend/game/data');

jest.spyOn(utils, 'createCombatant');

beforeEach(() => {
  jest.clearAllMocks();
  gameData.gameData.heroes = new Map(allPossibleHeroes.map(h => [h.id, h]));
  gameData.gameData.abilities = new Map(allPossibleAbilities.map(a => [a.id, a]));
  GameEngine.mockImplementation(() => ({
    runGameSteps: function* () {
      yield { combatants: [], log: [{ round: 1, type: 'info', level: 'summary', message: 'log' }] };
    },
    runFullGame: jest.fn(),
    winner: 'player',
    finalPlayerState: {}
  }));
});

test('follow up when battle log DM fails', async () => {
  userService.getUser.mockResolvedValue({
    id: 1,
    class: 'Warrior',
    equipped_ability_id: 50,
    dm_battle_logs_enabled: true
  });
  abilityCardService.getCards.mockResolvedValue([{ id: 50, ability_id: 3111, charges: 5 }]);
  const interaction = {
    user: { id: '123', username: 'tester', send: jest.fn().mockRejectedValue(new Error('fail')) },
    reply: jest.fn().mockResolvedValue(),
    followUp: jest.fn().mockResolvedValue()
  };
  await practice.execute(interaction);
  const ephemerals = interaction.followUp.mock.calls.filter(c => c[0].ephemeral);
  expect(ephemerals.length).toBeGreaterThan(0);
});
