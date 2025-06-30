const challenge = require('../commands/challenge');

jest.mock('../util/database', () => ({
  query: jest.fn().mockResolvedValue([{ insertId: 42 }])
}));
jest.mock('../src/utils/userService', () => ({
  getUser: jest.fn()
}));
jest.mock('../src/utils/embedBuilder', () => ({
  simple: jest.fn().mockReturnValue({})
}));

const db = require('../util/database');
const userService = require('../src/utils/userService');
const { simple } = require('../src/utils/embedBuilder');

describe('challenge command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('rejects self challenge', async () => {
    const interaction = {
      user: { id: '1' },
      options: { getUser: jest.fn().mockReturnValue({ id: '1', bot: false }) },
      reply: jest.fn().mockResolvedValue()
    };
    await challenge.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ ephemeral: true }));
  });

  test('creates pending battle and sends DM', async () => {
    userService.getUser
      .mockResolvedValueOnce({ id: 10, class: 'Warrior' })
      .mockResolvedValueOnce({ id: 20, class: 'Mage' });
    const opponent = {
      id: '2',
      bot: false,
      username: 'Opp',
      send: jest.fn().mockResolvedValue(),
      displayAvatarURL: jest.fn()
    };
    const interaction = {
      user: { id: '1', username: 'Chal', displayAvatarURL: jest.fn() },
      options: { getUser: jest.fn().mockReturnValue(opponent) },
      reply: jest.fn().mockResolvedValue()
    };
    await challenge.execute(interaction);
    expect(db.query).toHaveBeenCalledWith(
      'INSERT INTO pvp_battles (challenger_id, challenged_id, status) VALUES (?, ?, ?)',
      [10, 20, 'pending']
    );
    expect(opponent.send).toHaveBeenCalled();
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ ephemeral: true }));
    expect(simple).toHaveBeenCalled();
  });
});
