const settings = require('../commands/settings');

jest.mock('../src/utils/userService', () => ({
  getUser: jest.fn(),
  createUser: jest.fn(),
  setDmPreference: jest.fn(),
  setLogVerbosity: jest.fn()
}));

const userService = require('../src/utils/userService');

function createInteraction() {
  return {
    user: { id: '123', username: 'tester' },
    reply: jest.fn().mockResolvedValue()
  };
}

describe('settings command', () => {
  beforeEach(() => jest.clearAllMocks());

  test('shows current settings', async () => {
    userService.getUser.mockResolvedValue({
      dm_battle_logs_enabled: true,
      dm_item_drops_enabled: false,
      log_verbosity: 'summary'
    });
    const interaction = createInteraction();
    await settings.execute(interaction);
    expect(userService.getUser).toHaveBeenCalledWith('123');
    expect(interaction.reply).toHaveBeenCalledWith(
      expect.objectContaining({ ephemeral: true, embeds: expect.any(Array), components: expect.any(Array) })
    );
  });

  test('creates user when missing', async () => {
    userService.getUser.mockResolvedValueOnce(null).mockResolvedValueOnce({
      dm_battle_logs_enabled: true,
      dm_item_drops_enabled: true,
      log_verbosity: 'summary'
    });
    const interaction = createInteraction();
    await settings.execute(interaction);
    expect(userService.createUser).toHaveBeenCalledWith('123', 'tester');
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ ephemeral: true }));
  });
});
