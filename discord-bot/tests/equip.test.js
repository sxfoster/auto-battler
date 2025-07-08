jest.mock('../util/database', () => ({ query: jest.fn() }));
const db = require('../util/database');
const equip = require('../commands/equip');

beforeEach(() => {
  db.query.mockReset();
});

test('equips owned weapon', async () => {
  db.query
    .mockResolvedValueOnce({ rows: [{ id: 1 }] })
    .mockResolvedValueOnce({ rows: [{ name: 'Sword' }] })
    .mockResolvedValueOnce({});

  const interaction = {
    options: {
      getString: jest.fn().mockReturnValue('weapon'),
      getInteger: jest.fn().mockReturnValue(5)
    },
    user: { id: '1' },
    reply: jest.fn().mockResolvedValue()
  };

  await equip.execute(interaction);

  expect(db.query).toHaveBeenNthCalledWith(
    1,
    'SELECT id FROM players WHERE discord_id = ?',
    ['1']
  );
  expect(db.query).toHaveBeenNthCalledWith(
    2,
    'SELECT name FROM user_weapons WHERE id = ? AND player_id = ?',
    [5, 1]
  );
  expect(db.query).toHaveBeenNthCalledWith(
    3,
    'UPDATE players SET equipped_weapon_id = ? WHERE id = ?',
    [5, 1]
  );
  expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ ephemeral: true }));
});

test('errors when item not owned', async () => {
  db.query
    .mockResolvedValueOnce({ rows: [{ id: 1 }] })
    .mockResolvedValueOnce({ rows: [] });

  const interaction = {
    options: {
      getString: jest.fn().mockReturnValue('armor'),
      getInteger: jest.fn().mockReturnValue(2)
    },
    user: { id: '1' },
    reply: jest.fn().mockResolvedValue()
  };

  await equip.execute(interaction);
  expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ ephemeral: true }));
});
