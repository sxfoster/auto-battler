const admin = require('../commands/admin');

jest.mock('../src/utils/userService', () => ({
  getUser: jest.fn(),
  addAbility: jest.fn()
}));
jest.mock('../src/utils/embedBuilder', () => ({
  sendCardDM: jest.fn()
}));

const userService = require('../src/utils/userService');
const { sendCardDM } = require('../src/utils/embedBuilder');
const gameData = require('../util/gameData');
const { allPossibleAbilities } = require('../../backend/game/data');

function createInteraction(role = 'Game Master') {
  return {
    member: { roles: { cache: { some: jest.fn(fn => fn({ name: role })) } } },
    options: {
      getSubcommand: jest.fn().mockReturnValue('grant-ability'),
      getUser: jest.fn().mockReturnValue({ id: '200', username: 'Target' }),
      getString: jest.fn()
    },
    reply: jest.fn().mockResolvedValue(),
    followUp: jest.fn().mockResolvedValue()
  };
}

describe('admin grant-ability command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    gameData.gameData.abilities = new Map(allPossibleAbilities.map(a => [a.id, a]));
  });

  test('requires Game Master role', async () => {
    const interaction = createInteraction('Player');
    interaction.options.getString.mockReturnValue('Power Strike');
    await admin.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({
      ephemeral: true,
      content: expect.stringContaining('necessary permissions')
    }));
  });

  test('errors when ability not found', async () => {
    const interaction = createInteraction();
    interaction.options.getString.mockReturnValue('Nonexistent');
    await admin.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({
      ephemeral: true,
      content: expect.stringContaining('Could not find an ability')
    }));
  });

  test('errors when user not found', async () => {
    const interaction = createInteraction();
    interaction.options.getString.mockReturnValue('Power Strike');
    userService.getUser.mockResolvedValue(null);
    await admin.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({
      ephemeral: true,
      content: expect.stringContaining('has not started playing yet')
    }));
  });

  test('grants ability and sends DM', async () => {
    const interaction = createInteraction();
    interaction.options.getString.mockReturnValue('Power Strike');
    userService.getUser.mockResolvedValue({ id: 1 });
    userService.addAbility.mockResolvedValue(99);
    await admin.execute(interaction);
    expect(userService.addAbility).toHaveBeenCalled();
    expect(sendCardDM).toHaveBeenCalled();
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({
      ephemeral: true,
      content: expect.stringContaining('successfully granted')
    }));
  });

  test('notifies when ability card DM fails', async () => {
    const interaction = createInteraction();
    interaction.options.getString.mockReturnValue('Power Strike');
    userService.getUser.mockResolvedValue({ id: 1 });
    userService.addAbility.mockResolvedValue(99);
    sendCardDM.mockRejectedValue(new Error('fail'));
    await admin.execute(interaction);
    expect(sendCardDM).toHaveBeenCalled();
    expect(interaction.followUp).toHaveBeenCalledWith(
      expect.objectContaining({ ephemeral: true })
    );
  });

  test('autocomplete suggests ability names', async () => {
    const interaction = {
      options: { getFocused: jest.fn().mockReturnValue('Power') },
      respond: jest.fn().mockResolvedValue()
    };
    await admin.autocomplete(interaction);
    const options = interaction.respond.mock.calls[0][0];
    expect(options.some(o => o.name === 'Power Strike')).toBe(true);
  });

  test('autocomplete does not suggest nonexistent abilities', async () => {
    const interaction = {
      options: { getFocused: jest.fn().mockReturnValue('Nonexistent') },
      respond: jest.fn().mockResolvedValue()
    };
    await admin.autocomplete(interaction);
    const options = interaction.respond.mock.calls[0][0];
    expect(options).toHaveLength(0);
  });
});
