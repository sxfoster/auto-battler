jest.mock('../src/utils/userService', () => ({
  getUser: jest.fn(),
  addAbility: jest.fn()
}));
jest.mock('../src/utils/abilityCardService', () => ({
  getCards: jest.fn()
}));
jest.mock('../../backend/game/engine');

const utils = require('../../backend/game/utils');
jest.spyOn(utils, 'createCombatant');
const adventure = require('../src/commands/adventure');
const classes = require('../src/data/classes');
const classAbilityMap = require('../src/data/classAbilityMap');
const { allPossibleAbilities } = require('../../backend/game/data');
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
      runFullGame: jest.fn().mockReturnValue([]),
      winner: 'player'
    }));
  });

  test('ephemeral reply when user lacks a class', async () => {
    userService.getUser.mockResolvedValue({ discord_id: '123', class: null });
    const interaction = { user: { id: '123' }, reply: jest.fn().mockResolvedValue() };
    await adventure.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ ephemeral: true }));
  });

  test('battle runs when user has a class', async () => {
    userService.getUser.mockResolvedValue({ id: 1, discord_id: '123', class: 'Warrior', equipped_ability_id: 50 });
    abilityCardService.getCards.mockResolvedValue([
      { id: 50, ability_id: 3111, charges: 5 },
      { id: 51, ability_id: 3112, charges: 5 }
    ]);
    const interaction = { user: { id: '123' }, reply: jest.fn().mockResolvedValue(), followUp: jest.fn().mockResolvedValue() };
    await adventure.execute(interaction);
    expect(abilityCardService.getCards).toHaveBeenCalledWith('123');
    expect(createCombatantSpy).toHaveBeenCalledWith(
      expect.objectContaining({ ability_id: 3111 }),
      'player',
      0
    );
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ content: 'The battle begins...' }));
    expect(interaction.followUp).toHaveBeenCalledWith(expect.objectContaining({ embeds: expect.any(Array) }));
  });

  test('ability drop message sent', async () => {
    userService.getUser.mockResolvedValue({ id: 1, discord_id: '123', class: 'Warrior', equipped_ability_id: 50 });
    abilityCardService.getCards.mockResolvedValue([{ id: 50, ability_id: 3111, charges: 5 }]);
    const interaction = { user: { id: '123' }, reply: jest.fn().mockResolvedValue(), followUp: jest.fn().mockResolvedValue() };
    jest.spyOn(Math, 'random').mockReturnValue(0);
    await adventure.execute(interaction);
    expect(abilityCardService.getCards).toHaveBeenCalledWith('123');
    const expectedId = allPossibleAbilities.find(
      a => a.class === classAbilityMap.Warrior && a.rarity === 'Common'
    ).id;
    expect(userService.addAbility).toHaveBeenCalledWith('123', expectedId);
    Math.random.mockRestore();
    const desc = interaction.followUp.mock.calls[0][0].embeds[0].data.description;
    expect(desc).toMatch(/dropped/);
  });

  test('no ability drop when defeated', async () => {
    GameEngine.mockImplementationOnce(() => ({
      runFullGame: jest.fn().mockReturnValue([]),
      winner: 'enemy'
    }));
    userService.getUser.mockResolvedValue({ id: 1, discord_id: '123', class: 'Warrior', equipped_ability_id: 50 });
    abilityCardService.getCards.mockResolvedValue([{ id: 50, ability_id: 3111, charges: 5 }]);
    const interaction = { user: { id: '123' }, reply: jest.fn().mockResolvedValue(), followUp: jest.fn().mockResolvedValue() };
    await adventure.execute(interaction);
    expect(abilityCardService.getCards).toHaveBeenCalledWith('123');
    expect(userService.addAbility).not.toHaveBeenCalled();
    const desc = interaction.followUp.mock.calls[0][0].embeds[0].data.description;
    expect(desc).toMatch(/defeated/);
  });


  test('drops correct ability based on goblin class', async () => {
    const targetClass = 'Barbarian';
    const index = classes.findIndex(c => c.name === targetClass);
    jest.spyOn(Math, 'random').mockReturnValue(index / classes.length + 0.0001);
    userService.getUser.mockResolvedValue({ id: 1, discord_id: '123', class: 'Warrior', equipped_ability_id: 50 });
    abilityCardService.getCards.mockResolvedValue([{ id: 50, ability_id: 3111, charges: 5 }]);
    const interaction = { user: { id: '123', send: jest.fn().mockResolvedValue() }, reply: jest.fn().mockResolvedValue(), followUp: jest.fn().mockResolvedValue() };
    await adventure.execute(interaction);
    expect(abilityCardService.getCards).toHaveBeenCalledWith('123');
    const expectedDrop = allPossibleAbilities.find(
      a => a.class === classAbilityMap[targetClass] && a.rarity === 'Common'
    ).id;
    expect(userService.addAbility).toHaveBeenCalledWith('123', expectedDrop);
    Math.random.mockRestore();
  });

});
