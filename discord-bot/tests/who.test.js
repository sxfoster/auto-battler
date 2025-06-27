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
    userService.getUser.mockResolvedValue({ name: 'Tester', class: 'Mage' });
    const interaction = {
      options: { getUser: jest.fn().mockReturnValue({ id: '123', username: 'Tester', displayAvatarURL: jest.fn().mockReturnValue('https://example.com/avatar.png') }) },
      reply: jest.fn().mockResolvedValue()
    };
    await who.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ embeds: expect.any(Array) }));
    expect(interaction.reply.mock.calls[0][0].ephemeral).toBeUndefined();
  });

  test('public reply when user lacks a class', async () => {
    userService.getUser.mockResolvedValue({ name: 'Tester', class: null });
    const interaction = {
      options: { getUser: jest.fn().mockReturnValue({ id: '123', username: 'Tester', displayAvatarURL: jest.fn().mockReturnValue('https://example.com/avatar.png') }) },
      reply: jest.fn().mockResolvedValue()
    };
    await who.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ embeds: expect.any(Array) }));
    expect(interaction.reply.mock.calls[0][0].ephemeral).toBeUndefined();
  });

  test('ephemeral reply on lookup failure', async () => {
    userService.getUser.mockResolvedValue(null);
    const interaction = {
      options: { getUser: jest.fn().mockReturnValue({ id: '123', username: 'Tester', displayAvatarURL: jest.fn().mockReturnValue('https://example.com/avatar.png') }) },
      reply: jest.fn().mockResolvedValue()
    };
    await who.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ ephemeral: true, embeds: expect.any(Array) }));
  });
});
