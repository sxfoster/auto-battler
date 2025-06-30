const tutorial = require('../commands/tutorial');

jest.mock('../src/utils/userService', () => ({
  getUser: jest.fn(),
  createUser: jest.fn(),
  addAbility: jest.fn(),
  markTutorialComplete: jest.fn()
}));
jest.mock('../../backend/game/engine');

const userService = require('../src/utils/userService');
const GameEngine = require('../../backend/game/engine');
const utils = require('../../backend/game/utils');
const { allPossibleAbilities } = require('../../backend/game/data');

jest.spyOn(utils, 'createCombatant');

describe('tutorial command', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    GameEngine.mockImplementation(() => ({
      runGameSteps: function* () {
        yield { combatants: [], log: [{ round: 1, type: 'info', message: 'log' }] };
      },
      runFullGame: jest.fn(),
      winner: 'player'
    }));
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('creates a user when none exists', async () => {
    userService.getUser.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 1 });
    const interaction = {
      user: { id: '1', username: 'Tester' },
      reply: jest.fn().mockResolvedValue(),
      followUp: jest.fn().mockResolvedValue()
    };
    await tutorial.execute(interaction);
    expect(userService.createUser).toHaveBeenCalledWith('1', 'Tester');
  });

  test('replies when already completed', async () => {
    userService.getUser.mockResolvedValue({ id: 1, tutorial_completed: 1 });
    const interaction = {
      user: { id: '1' },
      reply: jest.fn().mockResolvedValue()
    };
    await tutorial.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ ephemeral: true }));
  });

  test('grants a common ability and marks completion', async () => {
    userService.getUser.mockResolvedValue({ id: 1, tutorial_completed: 0 });
    const interaction = {
      user: { id: '1', username: 'Tester' },
      reply: jest.fn().mockResolvedValue(),
      followUp: jest.fn().mockResolvedValue()
    };
    jest.spyOn(Math, 'random').mockReturnValue(0);
    await tutorial.execute(interaction);
    const abilityId = allPossibleAbilities.filter(a => a.rarity === 'Common')[0].id;
    expect(userService.addAbility).toHaveBeenCalledWith('1', abilityId);
    jest.runAllTimers();
    await Promise.resolve();
    expect(userService.markTutorialComplete).toHaveBeenCalledWith('1');
    const ephemeralCalls = interaction.followUp.mock.calls.filter(c => c[0].ephemeral);
    expect(ephemeralCalls.length).toBeGreaterThan(0);
    Math.random.mockRestore();
  });
});
