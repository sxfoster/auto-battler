const game = require('../src/commands/game');

jest.mock('../src/utils/userService', () => ({
  getUser: jest.fn(),
  createUser: jest.fn(),
  setUserClass: jest.fn(),
  getUserByName: jest.fn()
}));
const userService = require('../src/utils/userService');

describe('game command onboarding', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('new users triggering the onboarding flow', async () => {
    userService.getUser.mockResolvedValueOnce(null);
    userService.createUser.mockResolvedValueOnce();
    userService.getUser.mockResolvedValueOnce({ discord_id: '123', class: null });

    const interaction = {
      user: { id: '123' },
      options: {},
      reply: jest.fn().mockResolvedValue()
    };

    await game.execute(interaction);
    expect(userService.createUser).toHaveBeenCalledWith('123');
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ ephemeral: true }));
  });

  test('class selection persists via userService', async () => {
    const selectInteraction = {
      values: ['Warrior'],
      customId: 'class-select',
      update: jest.fn().mockResolvedValue()
    };

    await game.handleClassSelect(selectInteraction);
    expect(selectInteraction.update).toHaveBeenCalled();

    const buttonInteraction = {
      customId: 'class-confirm:Warrior',
      user: { id: '123' },
      reply: jest.fn().mockResolvedValue()
    };
    userService.getUser.mockResolvedValueOnce({ discord_id: '123', class: null });
    await game.handleClassButton(buttonInteraction);
    expect(userService.setUserClass).toHaveBeenCalledWith('123', 'Warrior');
    expect(buttonInteraction.reply).toHaveBeenCalled();
  });

  test('existing users receive already chosen message', async () => {
    userService.getUser.mockResolvedValue({ discord_id: '123', class: 'Bard' });

    const interaction = {
      user: { id: '123' },
      options: {},
      reply: jest.fn().mockResolvedValue()
    };

    await game.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ content: expect.stringContaining('cannot be changed') }));
    expect(userService.createUser).not.toHaveBeenCalled();
  });
});
