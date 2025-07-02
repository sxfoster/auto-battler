const tutorial = require('../commands/tutorial');

jest.mock('../src/utils/userService', () => ({
  getUser: jest.fn(),
  createUser: jest.fn(),
  setActiveAbility: jest.fn(),
  setUserClass: jest.fn(),
  markTutorialComplete: jest.fn(),
  setUserState: jest.fn(),
  setTutorialStep: jest.fn(),
  completeTutorial: jest.fn()
}));
jest.mock('../src/utils/weaponService', () => ({
  addWeapon: jest.fn(),
  setEquippedWeapon: jest.fn()
}));
jest.mock('../src/utils/abilityCardService', () => ({
  addCard: jest.fn()
}));
jest.mock('../../backend/game/engine');

const userService = require('../src/utils/userService');
const weaponService = require('../src/utils/weaponService');
const abilityCardService = require('../src/utils/abilityCardService');
const GameEngine = require('../../backend/game/engine');
const gameData = require('../util/gameData');
const { allPossibleHeroes, allPossibleAbilities, allPossibleWeapons } = require('../../backend/game/data');

GameEngine.mockImplementation(() => ({
  runGameSteps: function* () {
    yield { combatants: [], log: [] };
  },
  winner: 'player'
}));

describe('tutorial command', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    gameData.gameData.heroes = new Map(allPossibleHeroes.map(h => [h.id, h]));
    gameData.gameData.abilities = new Map(allPossibleAbilities.map(a => [a.id, a]));
    gameData.gameData.weapons = new Map(allPossibleWeapons.map(w => [w.id, w]));
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('creates a user when none exists', async () => {
    userService.getUser.mockResolvedValue(null);
    userService.createUser.mockResolvedValue({ id: 1, tutorial_completed: 0 });
    const interaction = { user: { id: '1', username: 'Tester' }, reply: jest.fn() };
    await tutorial.execute(interaction);
    expect(userService.createUser).toHaveBeenCalledWith('1', 'Tester');
    expect(userService.setUserState).toHaveBeenCalledWith('1', 'in_tutorial');
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ embeds: expect.any(Array) }));
  });

  test('replies when already completed', async () => {
    userService.getUser.mockResolvedValue({ id: 1, tutorial_completed: 1 });
    const interaction = { user: { id: '1' }, reply: jest.fn() };
    await tutorial.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ ephemeral: true }));
  });

  test('sends ambush embed and sets step', async () => {
    userService.getUser.mockResolvedValue({ id: 1, tutorial_completed: 0 });
    const interaction = { user: { id: '1', username: 'Tester' }, reply: jest.fn() };
    await tutorial.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ embeds: expect.any(Array), ephemeral: true }));
    expect(userService.setTutorialStep).toHaveBeenCalledWith('1', 'archetype_selection_prompt');
  });

  test('runTutorial presents loot choice', async () => {
    userService.getUser.mockResolvedValue({ id: 1 });
    const interaction = { user: { id: '1', username: 'Tester' }, followUp: jest.fn() };
    await tutorial.runTutorial(interaction, 'Stalwart Defender');
    expect(userService.setUserClass).toHaveBeenCalledWith('1', 'Stalwart Defender');
    expect(userService.setTutorialStep).toHaveBeenCalledWith('1', 'loot_choice');
    const call = interaction.followUp.mock.calls.find(c => c[0].embeds);
    expect(call).toBeDefined();
  });

  test('handleLootChoice awards weapon', async () => {
    userService.getUser.mockResolvedValue({ id: 1 });
    const interaction = { user: { id: '1' }, update: jest.fn() };
    await tutorial.handleLootChoice(interaction, 'weapon');
    expect(weaponService.addWeapon).toHaveBeenCalled();
    expect(weaponService.setEquippedWeapon).toHaveBeenCalled();
    expect(userService.setTutorialStep).toHaveBeenCalledWith('1', 'town_arrival');
    expect(interaction.update).toHaveBeenCalled();
  });

  test('handleLootChoice awards ability', async () => {
    userService.getUser.mockResolvedValue({ id: 1 });
    const interaction = { user: { id: '1' }, update: jest.fn() };
    await tutorial.handleLootChoice(interaction, 'ability');
    expect(abilityCardService.addCard).toHaveBeenCalled();
    expect(userService.setTutorialStep).toHaveBeenCalledWith('1', 'town_arrival');
    expect(interaction.update).toHaveBeenCalled();
  });
});
