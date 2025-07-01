const who = require('../commands/who');

jest.mock('../src/utils/userService', () => ({
  getUser: jest.fn()
}));
jest.mock('../src/utils/abilityCardService', () => ({
  getCard: jest.fn()
}));
const userService = require('../src/utils/userService');
const abilityCardService = require('../src/utils/abilityCardService');
const gameData = require('../util/gameData');
const { allPossibleAbilities, allPossibleHeroes } = require('../../backend/game/data');

describe('who command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    gameData.gameData.heroes = new Map(allPossibleHeroes.map(h => [h.id, h]));
    gameData.gameData.abilities = new Map(allPossibleAbilities.map(a => [a.id, a]));
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
    expect(fields[1].value).toBe('Stalwart Defender (Common)');
    expect(fields[4].value).toContain('Power Strike');
    expect(interaction.reply.mock.calls[0][0].ephemeral).toBe(true);
  });

  test('public reply when user lacks a class', async () => {
    userService.getUser.mockResolvedValue({ name: 'Tester', class: null });
    const interaction = {
      options: { getUser: jest.fn().mockReturnValue({ id: '123', username: 'Tester', displayAvatarURL: jest.fn().mockReturnValue('https://example.com/avatar.png') }) },
      reply: jest.fn().mockResolvedValue()
    };
    await who.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ embeds: expect.any(Array) }));
    expect(interaction.reply.mock.calls[0][0].ephemeral).toBe(true);
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
    expect(fields[1].value).toBe('None');
    expect(fields[4].value).toBe('None');
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
