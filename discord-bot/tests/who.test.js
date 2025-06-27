const who = require('../commands/who');

jest.mock('../src/utils/userService', () => ({
  getUser: jest.fn()
}));
const userService = require('../src/utils/userService');

describe('who command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('public reply when user has a class', async () => {
    userService.getUser.mockResolvedValue({ discord_id: '123', class: 'Mage' });
    const interaction = { user: { id: '123' }, reply: jest.fn().mockResolvedValue() };
    await who.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ content: expect.stringContaining('Mage') }));
    expect(interaction.reply.mock.calls[0][0].ephemeral).toBeUndefined();
  });

  test('ephemeral reply when user lacks a class', async () => {
    userService.getUser.mockResolvedValue({ discord_id: '123', class: null });
    const interaction = { user: { id: '123' }, reply: jest.fn().mockResolvedValue() };
    await who.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ ephemeral: true }));
  });

  test('ephemeral reply on lookup failure', async () => {
    userService.getUser.mockRejectedValue(new Error('fail'));
    const interaction = { user: { id: '123' }, reply: jest.fn().mockResolvedValue() };
    await who.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ ephemeral: true }));
  });
});
