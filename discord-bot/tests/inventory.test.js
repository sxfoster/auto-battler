const inventory = require('../commands/inventory');

jest.mock('../src/utils/userService', () => ({
  getUser: jest.fn()
}));
const userService = require('../src/utils/userService');

jest.mock('../src/utils/abilityCardService', () => ({
  getAbilityCards: jest.fn(),
  getEquippedAbility: jest.fn()
}));
const abilityCardService = require('../src/utils/abilityCardService');

describe('inventory command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('public reply when user has a class', async () => {
    userService.getUser.mockResolvedValue({ name: 'Tester', class: 'Warrior' });
    abilityCardService.getAbilityCards.mockResolvedValue([{ name: 'Shield Bash', charges: 5 }]);
    abilityCardService.getEquippedAbility.mockResolvedValue({ name: 'Shield Bash', charges: 5, equipped: true });
    const interaction = {
      user: { id: '123', displayAvatarURL: jest.fn().mockReturnValue('https://example.com/avatar.png') },
      reply: jest.fn().mockResolvedValue()
    };
    await inventory.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ embeds: expect.any(Array) }));
    expect(interaction.reply.mock.calls[0][0].ephemeral).toBeUndefined();
    expect(abilityCardService.getAbilityCards).toHaveBeenCalledWith('123');
    expect(abilityCardService.getEquippedAbility).toHaveBeenCalledWith('123');
  });

  test('ephemeral reply when user lacks a class', async () => {
    userService.getUser.mockResolvedValue({ name: 'Tester', class: null });
    const interaction = {
      user: { id: '123', displayAvatarURL: jest.fn().mockReturnValue('https://example.com/avatar.png') },
      reply: jest.fn().mockResolvedValue()
    };
    await inventory.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ ephemeral: true }));
    expect(abilityCardService.getAbilityCards).not.toHaveBeenCalled();
    expect(abilityCardService.getEquippedAbility).not.toHaveBeenCalled();
  });

  test('ephemeral reply when user not found', async () => {
    userService.getUser.mockResolvedValue(null);
    const interaction = {
      user: { id: '123', displayAvatarURL: jest.fn().mockReturnValue('https://example.com/avatar.png') },
      reply: jest.fn().mockResolvedValue()
    };
    await inventory.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ ephemeral: true }));
    expect(abilityCardService.getAbilityCards).not.toHaveBeenCalled();
    expect(abilityCardService.getEquippedAbility).not.toHaveBeenCalled();
  });
});
