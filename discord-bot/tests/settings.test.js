const settings = require('../commands/settings');

jest.mock('../src/utils/userService', () => ({
  getUser: jest.fn(),
  updateSettings: jest.fn(),
  addAbility: jest.fn(),
  createUser: jest.fn(),
  setActiveAbility: jest.fn()
}));
jest.mock('../src/utils/embedBuilder', () => ({
  sendCardDM: jest.fn(),
  buildBattleEmbed: jest.fn(() => ({}))
}));
const userService = require('../src/utils/userService');
const { sendCardDM } = require('../src/utils/embedBuilder');
const adventure = require('../src/commands/adventure');
const abilityCardService = require('../src/utils/abilityCardService');
jest.mock('../src/utils/abilityCardService', () => ({
  getCards: jest.fn(),
  addCard: jest.fn()
}));
const GameEngine = require('../../backend/game/engine');
jest.mock('../../backend/game/engine');
const utils = require('../../backend/game/utils');

jest.spyOn(utils, 'createCombatant');

beforeEach(() => {
  jest.clearAllMocks();
  GameEngine.mockImplementation(() => ({
    runGameSteps: function* () {
      yield { combatants: [], log: [] };
    },
    runFullGame: jest.fn(),
    winner: 'player',
    finalPlayerState: {}
  }));
});

test('battle_logs disabled updates DB and no DM is sent', async () => {
  userService.getUser.mockResolvedValue({ id: 1 });
  const interaction = {
    user: { id: '1', send: jest.fn() },
    options: {
      getSubcommand: jest.fn().mockReturnValue('battle_logs'),
      getBoolean: jest.fn().mockReturnValue(false)
    },
    reply: jest.fn().mockResolvedValue()
  };
  await settings.execute(interaction);
  expect(userService.updateSettings).toHaveBeenCalledWith('1', {
    battle_logs: false
  });
  expect(interaction.user.send).not.toHaveBeenCalled();
});

test('item_drops disabled prevents sendCardDM', async () => {
  // first disable item drops
  userService.getUser.mockResolvedValue({ id: 1 });
  const settingsInteraction = {
    user: { id: '1' },
    options: {
      getSubcommand: jest.fn().mockReturnValue('item_drops'),
      getBoolean: jest.fn().mockReturnValue(false)
    },
    reply: jest.fn().mockResolvedValue()
  };
  await settings.execute(settingsInteraction);
  expect(userService.updateSettings).toHaveBeenCalledWith('1', {
    item_drops: false
  });

  // run an adventure with item drops disabled
  userService.getUser.mockResolvedValue({
    id: 1,
    discord_id: '1',
    class: 'Warrior',
    equipped_ability_id: 50,
    item_drops: false
  });
  abilityCardService.getCards.mockResolvedValue([{ id: 50, ability_id: 3111, charges: 5 }]);
  jest.spyOn(Math, 'random').mockReturnValue(0);
  const advInteraction = {
    user: { id: '1', username: 'tester', send: jest.fn() },
    reply: jest.fn().mockResolvedValue(),
    followUp: jest.fn().mockResolvedValue()
  };
  await adventure.execute(advInteraction);
  expect(sendCardDM).not.toHaveBeenCalled();
  Math.random.mockRestore();
});
