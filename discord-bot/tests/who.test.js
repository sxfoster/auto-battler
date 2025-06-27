const who = require('../commands/who');

jest.mock('../src/utils/userService', () => ({
  getUserByName: jest.fn()
}));
const userService = require('../src/utils/userService');

describe('who command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('public reply when user has a class', async () => {
    userService.getUserByName.mockResolvedValue({ name: 'Tester', class: 'Mage' });
    const interaction = {
      options: { getString: jest.fn().mockReturnValue('tester') },
      reply: jest.fn().mockResolvedValue()
    };
    await who.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ content: 'Tester - Mage' }));
    expect(interaction.reply.mock.calls[0][0].ephemeral).toBeUndefined();
  });

  test('public reply when user lacks a class', async () => {
    userService.getUserByName.mockResolvedValue({ name: 'Tester', class: null });
    const interaction = {
      options: { getString: jest.fn().mockReturnValue('tester') },
      reply: jest.fn().mockResolvedValue()
    };
    await who.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ content: 'Tester has not yet chosen a class.' }));
    expect(interaction.reply.mock.calls[0][0].ephemeral).toBeUndefined();
  });

  test('ephemeral reply on lookup failure', async () => {
    userService.getUserByName.mockResolvedValue(null);
    const interaction = {
      options: { getString: jest.fn().mockReturnValue('tester') },
      reply: jest.fn().mockResolvedValue()
    };
    await who.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ ephemeral: true }));
  });
});
