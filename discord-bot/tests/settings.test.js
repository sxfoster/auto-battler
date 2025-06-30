const settings = require('../commands/settings');

jest.mock('../src/utils/userService', () => ({
  setDmPreference: jest.fn()
}));

const userService = require('../src/utils/userService');

function createInteraction(sub, enabled) {
  return {
    user: { id: '123' },
    options: {
      getSubcommand: jest.fn().mockReturnValue(sub),
      getBoolean: jest.fn().mockReturnValue(enabled)
    },
    reply: jest.fn().mockResolvedValue()
  };
}

describe('settings command', () => {
  beforeEach(() => jest.clearAllMocks());

  test('updates battle log preference', async () => {
    const interaction = createInteraction('battle_logs', true);
    await settings.execute(interaction);
    expect(userService.setDmPreference).toHaveBeenCalledWith('123', 'dm_battle_logs_enabled', true);
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ ephemeral: true }));
  });

  test('updates item drop preference', async () => {
    const interaction = createInteraction('item_drops', false);
    await settings.execute(interaction);
    expect(userService.setDmPreference).toHaveBeenCalledWith('123', 'dm_item_drops_enabled', false);
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ ephemeral: true }));
  });
});
