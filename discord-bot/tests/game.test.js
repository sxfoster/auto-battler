const game = require('../src/commands/game');

jest.mock('../src/utils/userService', () => ({
  getUser: jest.fn(),
  createUser: jest.fn()
}));
const userService = require('../src/utils/userService');

describe('game command onboarding', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('new users triggering the onboarding flow', async () => {
    userService.getUser.mockResolvedValueOnce(null);
    userService.createUser.mockResolvedValueOnce();

    const interaction = {
      user: { id: '123', username: 'tester' },
      options: {},
      reply: jest.fn().mockResolvedValue()
    };

    await game.execute(interaction);
    expect(userService.createUser).toHaveBeenCalledWith('123', 'tester');
    expect(interaction.reply).toHaveBeenCalledWith({
      content:
        'Your class is determined by the ability card you equip. Use `/inventory set` to change archetypes.',
      ephemeral: true
    });
  });

  test('existing users receive info message', async () => {
    userService.getUser.mockResolvedValue({ discord_id: '123', class: 'Bard' });

    const interaction = {
      user: { id: '123', username: 'tester' },
      options: {},
      reply: jest.fn().mockResolvedValue()
    };

    await game.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith({
      content:
        'Your class is determined by the ability card you equip. Use `/inventory set` to change archetypes.',
      ephemeral: true
    });
    expect(userService.createUser).not.toHaveBeenCalled();
  });
});
