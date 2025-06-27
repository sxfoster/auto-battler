const who = require('../commands/who');

jest.mock('../src/utils/userService', () => ({
  getUserByName: jest.fn()
}));
const userService = require('../src/utils/userService');

describe('who command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('replies with class when user has class', async () => {
    userService.getUserByName.mockResolvedValue({ name: 'Alice', class: 'Bard' });
    const interaction = {
      options: { getString: jest.fn().mockReturnValue('Alice') },
      reply: jest.fn().mockResolvedValue()
    };
    await who.execute(interaction);
    expect(userService.getUserByName).toHaveBeenCalledWith('Alice');
    expect(interaction.reply).toHaveBeenCalledWith({ content: 'Alice - Bard' });
  });

  test('replies when user has no class', async () => {
    userService.getUserByName.mockResolvedValue({ name: 'Bob', class: null });
    const interaction = {
      options: { getString: jest.fn().mockReturnValue('Bob') },
      reply: jest.fn().mockResolvedValue()
    };
    await who.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith({ content: 'Bob has not yet chosen a class.' });
  });

  test('ephemeral reply when user not found', async () => {
    userService.getUserByName.mockResolvedValue(null);
    const interaction = {
      options: { getString: jest.fn().mockReturnValue('Eve') },
      reply: jest.fn().mockResolvedValue()
    };
    await who.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith({ content: 'Could not find a player named Eve.', ephemeral: true });
  });
});
