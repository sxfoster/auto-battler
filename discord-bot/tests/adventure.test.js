const adventure = require('../src/commands/adventure');

jest.mock('../src/utils/userService', () => ({
  getUser: jest.fn(),
  addAbility: jest.fn()
}));
const userService = require('../src/utils/userService');

describe('adventure command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    const interaction = { user: { id: '123' }, reply: jest.fn().mockResolvedValue(), followUp: jest.fn().mockResolvedValue() };
    await adventure.execute(interaction);
    expect(userService.addAbility).toHaveBeenCalled();
    expect(interaction.followUp).toHaveBeenCalledWith(expect.objectContaining({ content: expect.stringContaining('You found'), ephemeral: true }));
  });
});
