const tutorial = require('../commands/tutorial');

jest.mock('../src/utils/userService', () => ({
  getUser: jest.fn(),
  createUser: jest.fn(),
  addAbility: jest.fn(),
  markTutorialComplete: jest.fn()
}));
jest.mock('../src/utils/weaponService', () => ({
  addWeapon: jest.fn()
}));
jest.mock('../../backend/game/engine');

const userService = require('../src/utils/userService');
const weaponService = require('../src/utils/weaponService');
const GameEngine = require('../../backend/game/engine');
const utils = require('../../backend/game/utils');
const {
  allPossibleAbilities,
  allPossibleHeroes,
  allPossibleWeapons
} = require('../../backend/game/data');
const gameData = require('../util/gameData');

jest.spyOn(utils, 'createCombatant');

describe('tutorial command', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    gameData.gameData.heroes = new Map(allPossibleHeroes.map(h => [h.id, h]));
    gameData.gameData.abilities = new Map(allPossibleAbilities.map(a => [a.id, a]));
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
    const abilityId = allPossibleAbilities.filter(
      a =>
        a.rarity === 'Common' &&
        a.category === 'Offense' &&
        a.class ===
          (allPossibleHeroes.find(h => h.isBase) || allPossibleHeroes[0]).class
    )[0].id;
    expect(userService.addAbility).toHaveBeenCalledWith('1', abilityId);
    const rustyKnifeId = allPossibleWeapons.find(w => w.name === 'Rusty Knife').id;
    expect(weaponService.addWeapon).toHaveBeenCalledWith(1, rustyKnifeId);
    jest.runAllTimers();
    await Promise.resolve();
    expect(userService.markTutorialComplete).toHaveBeenCalledWith('1');
    const ephemeralCalls = interaction.followUp.mock.calls.filter(c => c[0].ephemeral);
    expect(ephemeralCalls.length).toBeGreaterThan(0);
    Math.random.mockRestore();
  });

  test('battle log uses single reply edited for each step', async () => {
    userService.getUser.mockResolvedValue({ id: 1, tutorial_completed: 0 });
    const editMock = jest.fn().mockResolvedValue();
    const interaction = {
      id: 'xyz',
      user: { id: '1', username: 'Tester', send: jest.fn() },
      reply: jest.fn().mockResolvedValue({ edit: editMock }),
      followUp: jest.fn().mockResolvedValue()
    };
    GameEngine.mockImplementationOnce(() => ({
      runGameSteps: function* () {
        yield { combatants: [], log: [{ round: 1, type: 'info', message: 'one' }] };
        yield { combatants: [], log: [{ round: 1, type: 'info', message: 'two' }] };
      },
      runFullGame: jest.fn(),
      winner: 'player'
    }));
    const exec = tutorial.execute(interaction);
    await jest.runAllTimersAsync();
    await exec;
    expect(interaction.reply).toHaveBeenCalledTimes(1);
    expect(editMock).toHaveBeenCalledTimes(1);
    expect(interaction.user.send).not.toHaveBeenCalled();
  });
});
