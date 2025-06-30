const inventory = require('../commands/inventory');

jest.mock('../src/utils/userService', () => ({
  getUser: jest.fn(),
  createUser: jest.fn()
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
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ embeds: expect.any(Array) }));
    expect(interaction.reply.mock.calls[0][0].ephemeral).toBeUndefined();
    const fields = interaction.reply.mock.calls[0][0].embeds[0].data.fields;
    expect(fields[0].value).toContain('Stalwart Defender (Common)');
    expect(fields[1].value).toContain('Power Strike');
  });

  test('shows inventory for user with no archetype', async () => {
    userService.getUser.mockResolvedValue({ id: 1, name: 'Tester', class: null, equipped_ability_id: null });
    abilityCardService.getCards.mockResolvedValue([]);
    const interaction = {
      user: { id: '123', displayAvatarURL: jest.fn().mockReturnValue('https://example.com/avatar.png') },
      options: { getSubcommand: jest.fn().mockReturnValue('show') },
      reply: jest.fn().mockResolvedValue()
    };
    await inventory.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ embeds: expect.any(Array) }));
    const fields = interaction.reply.mock.calls[0][0].embeds[0].data.fields;
    expect(fields[0].value).toContain('No Archetype Selected');
  });

  test('creates user when not found', async () => {
    userService.getUser.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 1, name: 'Tester', class: null, equipped_ability_id: null });
    const interaction = {
      user: { id: '123', username: 'Tester', displayAvatarURL: jest.fn().mockReturnValue('https://example.com/avatar.png') },
      options: { getSubcommand: jest.fn().mockReturnValue('show') },
      reply: jest.fn().mockResolvedValue()
    };
    await inventory.execute(interaction);
    expect(userService.createUser).toHaveBeenCalledWith('123', 'Tester');
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ embeds: expect.any(Array) }));
  });

  test('lists ability cards in backpack', async () => {
    userService.getUser.mockResolvedValue({ id: 1, name: 'Tester', class: 'Warrior', equipped_ability_id: 42 });
    abilityCardService.getCards.mockResolvedValue([
      { id: 42, ability_id: 3111, charges: 5 },
      { id: 43, ability_id: 3111, charges: 3 }
    ]);
    const interaction = {
      user: { id: '123', displayAvatarURL: jest.fn().mockReturnValue('https://example.com/avatar.png') },
      options: { getSubcommand: jest.fn().mockReturnValue('show') },
      reply: jest.fn().mockResolvedValue()
    };
    await inventory.execute(interaction);
    expect(interaction.reply.mock.calls[0][0].embeds[0].data.fields[2].value).toContain('Power Strike');
  });

  test('set subcommand shows dropdown', async () => {
    userService.getUser.mockResolvedValue({ id: 1, name: 'Tester', class: 'Warrior', equipped_ability_id: null });
    abilityCardService.getCards.mockResolvedValue([
      { id: 1, ability_id: 3111, charges: 5 },
      { id: 2, ability_id: 3111, charges: 3 }
    ]);
    const interaction = {
      user: { id: '123' },
      options: {
        getSubcommand: jest.fn().mockReturnValue('set'),
        getString: jest.fn().mockReturnValue('Power Strike')
      },
      reply: jest.fn().mockResolvedValue()
    };
    await inventory.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ components: expect.any(Array) }));
  });

  test('set subcommand equips when single copy', async () => {
    userService.getUser.mockResolvedValue({ id: 1, name: 'Tester', class: 'Warrior', equipped_ability_id: null });
    abilityCardService.getCards.mockResolvedValue([{ id: 50, ability_id: 3111, charges: 5 }]);
    const interaction = {
      user: { id: '123' },
      options: {
        getSubcommand: jest.fn().mockReturnValue('set'),
        getString: jest.fn().mockReturnValue('Power Strike')
      },
      reply: jest.fn().mockResolvedValue()
    };
    await inventory.execute(interaction);
    expect(abilityCardService.setEquippedCard).toHaveBeenCalledWith(1, 50);
    expect(interaction.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'You have equipped Power Strike. Your active archetype is now Stalwart Defender (Common).'
      })
    );
  });

  test('autocomplete suggests charged abilities', async () => {
    userService.getUser.mockResolvedValue({ id: 1, class: 'Warrior' });
    abilityCardService.getCards.mockResolvedValue([
      { id: 1, ability_id: 3111, charges: 5 },
      { id: 2, ability_id: 3111, charges: 0 },
      { id: 3, ability_id: 3211, charges: 3 },
      { id: 4, ability_id: 3211, charges: 2 }
    ]);
    const interaction = {
      user: { id: '123' },
      options: { getFocused: jest.fn().mockReturnValue('') },
      respond: jest.fn().mockResolvedValue()
    };
    await inventory.autocomplete(interaction);
    const options = interaction.respond.mock.calls[0][0];
    const names = options.map(o => o.name);
    expect(names).toContain('Power Strike');
    expect(names).toContain('Divine Strike');
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
    expect(interaction.update).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'You have equipped Power Strike. Your active archetype is now Stalwart Defender (Common).'
      })
    );
  });

  test('handleSetAbilityButton shows ability dropdown', async () => {
    userService.getUser.mockResolvedValue({ id: 1, name: 'Tester' });
    abilityCardService.getCards.mockResolvedValue([
      { id: 1, ability_id: 3111, charges: 5 },
      { id: 2, ability_id: 3111, charges: 0 },
      { id: 3, ability_id: 3111, charges: 2 }
    ]);
    const interaction = { user: { id: '123' }, reply: jest.fn().mockResolvedValue() };
    await inventory.handleSetAbilityButton(interaction);
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ components: expect.any(Array) }));
    const options =
      interaction.reply.mock.calls[0][0].components[0].components[0].toJSON().
        options;
    // The dropdown lists each ability only once regardless of duplicate cards
    expect(options).toHaveLength(1);
    expect(options[0]).toEqual(
      expect.objectContaining({ label: 'Power Strike', value: '3111' })
    );
  });

  test('handleAbilitySelect shows card dropdown when multiple copies', async () => {
    userService.getUser.mockResolvedValue({ id: 1, name: 'Tester', class: 'Warrior' });
    abilityCardService.getCards.mockResolvedValue([
      { id: 10, ability_id: 3111, charges: 5 },
      { id: 11, ability_id: 3111, charges: 4 }
    ]);
    const interaction = { user: { id: '123' }, values: ['3111'], update: jest.fn().mockResolvedValue() };
    await inventory.handleAbilitySelect(interaction);
    expect(interaction.update).toHaveBeenCalledWith(expect.objectContaining({ components: expect.any(Array) }));
  });

  test('handleAbilitySelect equips when single copy', async () => {
    userService.getUser.mockResolvedValue({ id: 1, name: 'Tester', class: 'Warrior' });
    abilityCardService.getCards.mockResolvedValue([{ id: 10, ability_id: 3111, charges: 5 }]);
    const interaction = { user: { id: '123' }, values: ['3111'], update: jest.fn().mockResolvedValue() };
    await inventory.handleAbilitySelect(interaction);
    expect(abilityCardService.setEquippedCard).toHaveBeenCalledWith(1, 10);
    expect(interaction.update).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'You have equipped Power Strike. Your active archetype is now Stalwart Defender (Common).'
      })
    );
  });

  test('execute equips ability from another class', async () => {
    userService.getUser.mockResolvedValue({ id: 1, name: 'Tester', class: 'Warrior' });
    abilityCardService.getCards.mockResolvedValue([{ id: 60, ability_id: 3211, charges: 5 }]);
    const interaction = {
      user: { id: '123' },
      options: {
        getSubcommand: jest.fn().mockReturnValue('set'),
        getString: jest.fn().mockReturnValue('Divine Strike')
      },
      reply: jest.fn().mockResolvedValue()
    };
    await inventory.execute(interaction);
    expect(abilityCardService.setEquippedCard).toHaveBeenCalledWith(1, 60);
    expect(interaction.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'You have equipped Divine Strike. Your active archetype is now Holy Warrior (Common).'
      })
    );
  });

  test('handleAbilitySelect equips ability from another class', async () => {
    userService.getUser.mockResolvedValue({ id: 1, class: 'Warrior' });
    abilityCardService.getCards.mockResolvedValue([{ id: 61, ability_id: 3211, charges: 5 }]);
    const interaction = { user: { id: '123' }, values: ['3211'], update: jest.fn().mockResolvedValue() };
    await inventory.handleAbilitySelect(interaction);
    expect(abilityCardService.setEquippedCard).toHaveBeenCalledWith(1, 61);
    expect(interaction.update).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'You have equipped Divine Strike. Your active archetype is now Holy Warrior (Common).'
      })
    );
  });

  test('handleEquipSelect equips card from another class', async () => {
    userService.getUser.mockResolvedValue({ id: 1, class: 'Warrior' });
    abilityCardService.getCards.mockResolvedValue([{ id: 62, ability_id: 3211, charges: 5 }]);
    const interaction = { user: { id: '123' }, values: ['62'], update: jest.fn().mockResolvedValue() };
    await inventory.handleEquipSelect(interaction);
    expect(abilityCardService.setEquippedCard).toHaveBeenCalledWith(1, 62);
    expect(interaction.update).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'You have equipped Divine Strike. Your active archetype is now Holy Warrior (Common).'
      })
    );
  });
});
