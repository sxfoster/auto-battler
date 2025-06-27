const set = require('../commands/set');

jest.mock('../src/utils/userService', () => ({
  setActiveAbility: jest.fn()
}));
const userService = require('../src/utils/userService');

describe('set command', () => {
  beforeEach(() => jest.clearAllMocks());

  test('calls userService to set ability', async () => {
    const interaction = {
      user: { id: '123' },
      options: { getString: jest.fn().mockReturnValue('Shield Bash') },
      reply: jest.fn().mockResolvedValue()
    };
    await set.execute(interaction);
    expect(userService.setActiveAbility).toHaveBeenCalledWith('123', 'Shield Bash');
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ ephemeral: true }));
  });
});
