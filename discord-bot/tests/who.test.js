const who = require('../commands/who');

jest.mock('../src/utils/userService', () => ({
  getUser: jest.fn()
}));
jest.mock('../src/utils/abilityCardService', () => ({
  getCard: jest.fn()
}));
const userService = require('../src/utils/userService');
const abilityCardService = require('../src/utils/abilityCardService');

describe('who command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('public reply when user has a class', async () => {
    userService.getUser.mockResolvedValue({ id: 1, name: 'Tester', class: 'Warrior', equipped_ability_id: 42 });
    abilityCardService.getCard.mockResolvedValue({ id: 42, ability_id: 3111 });
    const interaction = {
      options: {
        getUser: jest.fn().mockReturnValue({
          id: '123',
          username: 'Tester',
          displayAvatarURL: jest.fn().mockReturnValue('https://example.com/avatar.png')
        })
      },
      reply: jest.fn().mockResolvedValue()
    };
    await who.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ embeds: expect.any(Array) }));
    const fields = interaction.reply.mock.calls[0][0].embeds[0].data.fields;
    expect(fields[0].value).toBe('Tester');
    expect(fields[1].value).toBe('Warrior');
    expect(fields[4].value).toContain('Power Strike');
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
    const fields = interaction.reply.mock.calls[0][0].embeds[0].data.fields;
    expect(fields[1].value).toBe('None');
    expect(interaction.reply.mock.calls[0][0].ephemeral).toBeUndefined();
  });

  test('shows None when no ability equipped', async () => {
    userService.getUser.mockResolvedValue({ id: 1, name: 'Tester', class: 'Warrior', equipped_ability_id: null });
    const interaction = {
      options: {
        getUser: jest.fn().mockReturnValue({
          id: '123',
          username: 'Tester',
          displayAvatarURL: jest.fn().mockReturnValue('https://example.com/avatar.png')
        })
      },
      reply: jest.fn().mockResolvedValue()
    };
  await who.execute(interaction);
  const fields = interaction.reply.mock.calls[0][0].embeds[0].data.fields;
  expect(fields[1].value).toBe('Warrior');
  expect(fields[4].value).toBe('None');
});

  test('hides class when in active challenge', async () => {
    const futureDate = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    userService.getUser.mockResolvedValue({ id: 1, name: 'Tester', class: 'Warrior', pvp_status_until: futureDate, equipped_ability_id: null });
    const interaction = {
      options: { getUser: jest.fn().mockReturnValue({ id: '123', username: 'Tester', displayAvatarURL: jest.fn().mockReturnValue('https://example.com/avatar.png') }) },
      reply: jest.fn().mockResolvedValue()
    };
    await who.execute(interaction);
    const fields = interaction.reply.mock.calls[0][0].embeds[0].data.fields;
    expect(fields[1].value).toBe('Hidden (In a Challenge)');
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
