const adventure = require('../src/commands/adventure');

jest.mock('../src/utils/userService', () => ({
  getUser: jest.fn()
}));

const userService = require('../src/utils/userService');

describe('adventure command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('requires class selection', async () => {
    userService.getUser.mockResolvedValue(null);
    const interaction = { user: { id: '1' }, reply: jest.fn().mockResolvedValue() };
    await adventure.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ ephemeral: true }));
  });

  test('runs battle when class selected', async () => {
    userService.getUser.mockResolvedValue({ discord_id: '1', class: 'Warrior' });
    const interaction = { user: { id: '1', username: 'Tester' }, reply: jest.fn().mockResolvedValue(), followUp: jest.fn().mockResolvedValue() };
    await adventure.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith(expect.stringContaining('goblin cave'));
    expect(interaction.followUp).toHaveBeenCalled();
  });
});
