const inventory = require('../commands/inventory');

jest.mock('../src/utils/userService', () => ({
  getUser: jest.fn()
}));
jest.mock('../src/utils/abilityCardService', () => ({
  getCards: jest.fn(),
  setEquippedCard: jest.fn()
}));
const userService = require('../src/utils/userService');
const abilityCardService = require('../src/utils/abilityCardService');

describe('inventory command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('public reply when user has a class', async () => {
    userService.getUser.mockResolvedValue({ id: 1, name: 'Tester', class: 'Warrior', equipped_ability_id: 42 });
    abilityCardService.getCards.mockResolvedValue([
      { id: 42, ability_id: 3111, charges: 5 }
    ]);
    const interaction = {
      user: { id: '123', displayAvatarURL: jest.fn().mockReturnValue('https://example.com/avatar.png') },
      options: { getSubcommand: jest.fn().mockReturnValue('show') },
      reply: jest.fn().mockResolvedValue()
    };
    await inventory.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ embeds: expect.any(Array), components: expect.any(Array) }));
    expect(interaction.reply.mock.calls[0][0].ephemeral).toBeUndefined();
    expect(interaction.reply.mock.calls[0][0].embeds[0].data.fields[1].value).toContain('Power Strike');
    expect(interaction.reply.mock.calls[0][0].embeds[0].data.fields[2].value).toContain('✅ [Equipped]');
  });

  test('ephemeral reply when user lacks a class', async () => {
    userService.getUser.mockResolvedValue({ name: 'Tester', class: null });
    const interaction = {
      user: { id: '123', displayAvatarURL: jest.fn().mockReturnValue('https://example.com/avatar.png') },
      options: { getSubcommand: jest.fn().mockReturnValue('show') },
      reply: jest.fn().mockResolvedValue()
    };
    await inventory.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ ephemeral: true }));
  });

  test('ephemeral reply when user not found', async () => {
    userService.getUser.mockResolvedValue(null);
    const interaction = {
      user: { id: '123', displayAvatarURL: jest.fn().mockReturnValue('https://example.com/avatar.png') },
      options: { getSubcommand: jest.fn().mockReturnValue('show') },
      reply: jest.fn().mockResolvedValue()
    };
    await inventory.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ ephemeral: true }));
  });

  test('lists ability cards in backpack', async () => {
    userService.getUser.mockResolvedValue({ id: 1, name: 'Tester', class: 'Warrior', equipped_ability_id: 42 });
    abilityCardService.getCards.mockResolvedValue([
      { id: 42, ability_id: 3111, charges: 5 },
      { id: 43, ability_id: 3121, charges: 3 }
    ]);
    const interaction = {
      user: { id: '123', displayAvatarURL: jest.fn().mockReturnValue('https://example.com/avatar.png') },
      options: { getSubcommand: jest.fn().mockReturnValue('show') },
      reply: jest.fn().mockResolvedValue()
    };
    await inventory.execute(interaction);
    const backpack = interaction.reply.mock.calls[0][0].embeds[0].data.fields[2].value;
    expect(backpack).toContain('✅ [Equipped]');
    expect(backpack).toContain('📄 [Set]');
  });

  test('equip subcommand shows dropdown', async () => {
    userService.getUser.mockResolvedValue({ id: 1, name: 'Tester', class: 'Warrior', equipped_ability_id: null });
    abilityCardService.getCards.mockResolvedValue([
      { id: 1, ability_id: 3111, charges: 5 },
      { id: 2, ability_id: 3111, charges: 3 }
    ]);
    const interaction = {
      user: { id: '123' },
      options: {
        getSubcommand: jest.fn().mockReturnValue('equip'),
        getString: jest.fn().mockReturnValue('Power Strike')
      },
      reply: jest.fn().mockResolvedValue()
    };
    await inventory.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ components: expect.any(Array) }));
  });

  test('handleEquipSelect equips card', async () => {
    userService.getUser.mockResolvedValue({ id: 1, name: 'Tester', class: 'Warrior', equipped_ability_id: null });
    abilityCardService.getCards.mockResolvedValue([{ id: 99, ability_id: 3111, charges: 5 }]);
    const interaction = {
      user: { id: '123' },
      values: ['99'],
      update: jest.fn().mockResolvedValue()
    };
    await inventory.handleEquipSelect(interaction);
    expect(abilityCardService.setEquippedCard).toHaveBeenCalledWith(1, 99);
    expect(interaction.update).toHaveBeenCalled();
  });
});
