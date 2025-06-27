const inventory = require('../commands/inventory');

jest.mock('../src/utils/userService', () => ({
  getUser: jest.fn(),
  getInventory: jest.fn()
}));
const userService = require('../src/utils/userService');

describe('inventory command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('public reply when user has a class', async () => {
    userService.getUser.mockResolvedValue({ name: 'Tester', class: 'Warrior' });
    userService.getInventory.mockResolvedValue([{ name: 'Shield Bash', charges: 5 }]);
    const interaction = {
      user: { id: '123', displayAvatarURL: jest.fn().mockReturnValue('https://example.com/avatar.png') },
      reply: jest.fn().mockResolvedValue()
    };
    await inventory.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ embeds: expect.any(Array) }));
    expect(interaction.reply.mock.calls[0][0].ephemeral).toBeUndefined();
  });

  test('ephemeral reply when user lacks a class', async () => {
    userService.getUser.mockResolvedValue({ name: 'Tester', class: null });
    const interaction = {
      user: { id: '123', displayAvatarURL: jest.fn().mockReturnValue('https://example.com/avatar.png') },
      reply: jest.fn().mockResolvedValue()
    };
    await inventory.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ ephemeral: true }));
  });

  test('ephemeral reply when user not found', async () => {
    userService.getUser.mockResolvedValue(null);
    const interaction = {
      user: { id: '123', displayAvatarURL: jest.fn().mockReturnValue('https://example.com/avatar.png') },
      reply: jest.fn().mockResolvedValue()
    };
    await inventory.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ ephemeral: true }));
  });

  test('lists ability cards in backpack', async () => {
    userService.getUser.mockResolvedValue({ name: 'Tester', class: 'Warrior' });
    userService.getInventory.mockResolvedValue([{ name: 'Shield Bash', charges: 5 }]);
    const interaction = {
      user: { id: '123', displayAvatarURL: jest.fn().mockReturnValue('https://example.com/avatar.png') },
      reply: jest.fn().mockResolvedValue()
    };
    await inventory.execute(interaction);
    expect(interaction.reply.mock.calls[0][0].embeds[0].data.fields[1].value).toContain('Shield Bash');
  });
});
