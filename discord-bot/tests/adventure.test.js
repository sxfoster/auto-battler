jest.mock('../src/utils/userService', () => ({
  getUser: jest.fn(),
  addAbility: jest.fn(),
  createUser: jest.fn()
}));
jest.mock('../src/utils/abilityCardService', () => ({
  getCards: jest.fn()
}));
jest.mock('../../backend/game/engine');

const utils = require('../../backend/game/utils');
jest.spyOn(utils, 'createCombatant');
const adventure = require('../src/commands/adventure');
const { allPossibleAbilities, allPossibleHeroes } = require('../../backend/game/data');
const baseHeroes = allPossibleHeroes.filter(h => h.isBase);
const userService = require('../src/utils/userService');
const abilityCardService = require('../src/utils/abilityCardService');
const GameEngine = require('../../backend/game/engine');

describe('adventure command', () => {
  let createCombatantSpy;
  beforeEach(() => {
    jest.clearAllMocks();
    abilityCardService.getCards.mockResolvedValue([]);
    createCombatantSpy = utils.createCombatant;
    GameEngine.mockImplementation(() => ({
      runGameSteps: function* () {
        yield { combatants: [], log: [{ round: 1, type: 'info', message: 'log' }] };
      },
      runFullGame: jest.fn(),
      winner: 'player'
    }));
  });

  test('creates a new user when none exists', async () => {
    userService.getUser
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 1, discord_id: '123', class: null });
    userService.createUser.mockResolvedValueOnce();
    const interaction = {
      user: { id: '123', username: 'tester' },
      reply: jest.fn().mockResolvedValue(),
      followUp: jest.fn().mockResolvedValue()
    };
    await adventure.execute(interaction);
    expect(userService.createUser).toHaveBeenCalledWith('123', 'tester');
    expect(interaction.reply).toHaveBeenCalledWith(
      expect.objectContaining({ content: expect.stringContaining('Goblin') })
    );
  });

  test('battle runs when user has a class', async () => {
    userService.getUser.mockResolvedValue({ id: 1, discord_id: '123', class: 'Warrior', equipped_ability_id: 50 });
    abilityCardService.getCards.mockResolvedValue([
      { id: 50, ability_id: 3111, charges: 5 },
      { id: 51, ability_id: 3112, charges: 5 }
    ]);
    const interaction = { user: { id: '123' }, reply: jest.fn().mockResolvedValue(), followUp: jest.fn().mockResolvedValue() };
    await adventure.execute(interaction);
    expect(abilityCardService.getCards).toHaveBeenCalledWith(1);
    expect(createCombatantSpy).toHaveBeenCalledWith(
      expect.objectContaining({ ability_card: { id: 50, ability_id: 3111, charges: 5 } }),
      'player',
      0
    );
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ content: expect.stringContaining('Goblin') }));
    expect(interaction.followUp).toHaveBeenCalledWith(expect.objectContaining({ embeds: expect.any(Array) }));
  });

  test('warns when equipped ability has no charges', async () => {
    userService.getUser.mockResolvedValue({ id: 1, discord_id: '123', class: 'Warrior', equipped_ability_id: 50 });
    abilityCardService.getCards.mockResolvedValue([{ id: 50, ability_id: 3111, charges: 0 }]);
    const interaction = { user: { id: '123' }, reply: jest.fn().mockResolvedValue(), followUp: jest.fn().mockResolvedValue() };
    await adventure.execute(interaction);
    expect(createCombatantSpy).not.toHaveBeenCalled();
    expect(interaction.reply).toHaveBeenCalledWith(
      expect.objectContaining({ ephemeral: true, content: expect.stringContaining('Warning'), components: expect.any(Array) })
    );
  });

  test('ability drop message sent', async () => {
    userService.getUser.mockResolvedValue({ id: 1, discord_id: '123', class: 'Warrior', equipped_ability_id: 50 });
    abilityCardService.getCards.mockResolvedValue([{ id: 50, ability_id: 3111, charges: 5 }]);
    const interaction = { user: { id: '123' }, reply: jest.fn().mockResolvedValue(), followUp: jest.fn().mockResolvedValue() };
    jest.spyOn(Math, 'random').mockReturnValue(0);
    await adventure.execute(interaction);
    expect(abilityCardService.getCards).toHaveBeenCalledWith(1);
    const expectedId = allPossibleAbilities.find(
      a => a.class === baseHeroes[0].class && a.rarity === 'Common'
    ).id;
    expect(userService.addAbility).toHaveBeenCalledWith('123', expectedId);
    Math.random.mockRestore();
    expect(interaction.followUp).toHaveBeenCalledWith(
      expect.objectContaining({ embeds: expect.any(Array) })
    );
  });

  test('no ability drop when defeated', async () => {
    GameEngine.mockImplementationOnce(() => ({
      runGameSteps: function* () { yield { combatants: [], log: ['log'] }; },
      runFullGame: jest.fn(),
      winner: 'enemy'
    }));
    userService.getUser.mockResolvedValue({ id: 1, discord_id: '123', class: 'Warrior', equipped_ability_id: 50 });
    abilityCardService.getCards.mockResolvedValue([{ id: 50, ability_id: 3111, charges: 5 }]);
    const interaction = { user: { id: '123' }, reply: jest.fn().mockResolvedValue(), followUp: jest.fn().mockResolvedValue() };
    await adventure.execute(interaction);
    expect(abilityCardService.getCards).toHaveBeenCalledWith(1);
    expect(userService.addAbility).not.toHaveBeenCalled();
    const calls = interaction.followUp.mock.calls.filter(c => c[0].ephemeral);
    expect(calls.length).toBe(1);
  });

  test('battle log is included in embed', async () => {
    GameEngine.mockImplementationOnce(() => ({
      runGameSteps: function* () {
        yield { combatants: [], log: [
          { round: 1, type: 'info', level: 'summary', message: 'first' },
          { round: 1, type: 'info', level: 'summary', message: 'second' }
        ] };
      },
      runFullGame: jest.fn(),
      winner: 'player'
    }));
    userService.getUser.mockResolvedValue({ id: 1, discord_id: '123', class: 'Barbarian', equipped_ability_id: 50 });
    abilityCardService.getCards.mockResolvedValue([{ id: 50, ability_id: 3111, charges: 5 }]);
    const interaction = { user: { id: '123' }, reply: jest.fn().mockResolvedValue(), followUp: jest.fn().mockResolvedValue() };
    await adventure.execute(interaction);
    expect(abilityCardService.getCards).toHaveBeenCalledWith(1);
    const description = interaction.followUp.mock.calls[0][0].embeds[0].data.description;
    expect(description.includes('first')).toBe(true);
    expect(description.includes('second')).toBe(true);
  });

  test('drops correct ability based on goblin class', async () => {
    const targetName = 'Brawler';
    const index = baseHeroes.findIndex(h => h.name === targetName);
    jest.spyOn(Math, 'random').mockReturnValue(index / baseHeroes.length + 0.0001);
    userService.getUser.mockResolvedValue({ id: 1, discord_id: '123', class: 'Warrior', equipped_ability_id: 50 });
    abilityCardService.getCards.mockResolvedValue([{ id: 50, ability_id: 3111, charges: 5 }]);
    const interaction = { user: { id: '123', send: jest.fn().mockResolvedValue() }, reply: jest.fn().mockResolvedValue(), followUp: jest.fn().mockResolvedValue() };
    await adventure.execute(interaction);
    expect(abilityCardService.getCards).toHaveBeenCalledWith(1);
    const expectedDrop = allPossibleAbilities.find(
      a => a.class === baseHeroes[index].class && a.rarity === 'Common'
    ).id;
    expect(userService.addAbility).toHaveBeenCalledWith('123', expectedDrop);
    Math.random.mockRestore();
  });

  test('battle log is truncated to last 20 lines', async () => {
    const logs = Array.from({ length: 30 }, (_, i) => ({ round: 1, type: 'info', level: 'summary', message: String(i + 1) }));
    GameEngine.mockImplementationOnce(() => ({
      runGameSteps: function* () {
        yield { combatants: [], log: logs };
      },
      runFullGame: jest.fn(),
      winner: 'player'
    }));
    userService.getUser.mockResolvedValue({ id: 1, discord_id: '123', class: 'Barbarian', equipped_ability_id: 50 });
    abilityCardService.getCards.mockResolvedValue([{ id: 50, ability_id: 3111, charges: 5 }]);
    const interaction = { user: { id: '123' }, reply: jest.fn().mockResolvedValue(), followUp: jest.fn().mockResolvedValue() };
    await adventure.execute(interaction);
    expect(abilityCardService.getCards).toHaveBeenCalledWith(1);
    const description = interaction.followUp.mock.calls[0][0].embeds[0].data.description;
    const lines = description.split('\n');
    expect(lines.length).toBe(20);
    expect(lines[0].includes('11')).toBe(true);
    expect(lines[19].includes('30')).toBe(true);
  });
});
