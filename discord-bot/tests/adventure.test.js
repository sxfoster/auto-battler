const adventure = require('../src/commands/adventure');

jest.mock('../src/utils/userService', () => ({
  getUser: jest.fn(),
  addAbility: jest.fn()
}));
jest.mock('../../backend/game/engine');
const userService = require('../src/utils/userService');
const GameEngine = require('../../backend/game/engine');

describe('adventure command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    GameEngine.mockImplementation(() => ({
      runFullGame: jest.fn(() => ['log']),
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
    userService.getUser.mockResolvedValue({ discord_id: '123', class: 'Warrior' });
    const interaction = { user: { id: '123' }, reply: jest.fn().mockResolvedValue(), followUp: jest.fn().mockResolvedValue() };
    await adventure.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ content: expect.stringContaining('Goblin') }));
    expect(interaction.followUp).toHaveBeenCalledWith(expect.objectContaining({ embeds: expect.any(Array) }));
  });

  test('ability drop message sent', async () => {
    userService.getUser.mockResolvedValue({ discord_id: '123', class: 'Warrior' });
    jest.spyOn(Math, 'random').mockReturnValue(0);
    const interaction = { user: { id: '123' }, reply: jest.fn().mockResolvedValue(), followUp: jest.fn().mockResolvedValue() };
    await adventure.execute(interaction);
    expect(userService.addAbility).toHaveBeenCalled();
    expect(interaction.followUp).toHaveBeenCalledWith(expect.objectContaining({ embeds: expect.any(Array), ephemeral: true }));
    Math.random.mockRestore();
  });

  test('no ability drop when defeated', async () => {
    GameEngine.mockImplementationOnce(() => ({
      runFullGame: jest.fn(() => ['log']),
      winner: 'enemy'
    }));
    userService.getUser.mockResolvedValue({ discord_id: '123', class: 'Warrior' });
    const interaction = { user: { id: '123' }, reply: jest.fn().mockResolvedValue(), followUp: jest.fn().mockResolvedValue() };
    await adventure.execute(interaction);
    expect(userService.addAbility).not.toHaveBeenCalled();
    const calls = interaction.followUp.mock.calls.filter(c => c[0].ephemeral);
    expect(calls.length).toBe(0);
  });

  test('battle log is included in embed', async () => {
    userService.getUser.mockResolvedValue({ discord_id: '123', class: 'Barbarian' });
    const interaction = { user: { id: '123' }, reply: jest.fn().mockResolvedValue(), followUp: jest.fn().mockResolvedValue() };
    await adventure.execute(interaction);
    const description = interaction.followUp.mock.calls[0][0].embeds[0].data.description;
    expect(description).toContain('log');
  });
});
