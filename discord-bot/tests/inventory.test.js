jest.mock('../util/database', () => ({ query: jest.fn() }));
const db = require('../util/database');
const inventory = require('../commands/inventory');

beforeEach(() => {
  db.query.mockReset();
});

test('replies with inventory for existing player', async () => {
  db.query
    .mockResolvedValueOnce({ rows: [{ id: 1, equipped_weapon_id: 2, equipped_armor_id: null, equipped_ability_id: 3 }] })
    .mockResolvedValueOnce({ rows: [{ id: 2, name: 'Sword' }] })
    .mockResolvedValueOnce({ rows: [] })
    .mockResolvedValueOnce({ rows: [{ id: 3, name: 'Fireball' }] });

  const interaction = { user: { id: '1' }, reply: jest.fn().mockResolvedValue() };
  await inventory.execute(interaction);

  expect(db.query).toHaveBeenNthCalledWith(
    1,
    'SELECT id, equipped_weapon_id, equipped_armor_id, equipped_ability_id FROM players WHERE discord_id = ?',
    ['1']
  );
  expect(db.query).toHaveBeenCalledTimes(4);
  expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ ephemeral: true }));
});

test('replies when player missing', async () => {
  db.query.mockResolvedValueOnce({ rows: [] });
  const interaction = { user: { id: '2' }, reply: jest.fn().mockResolvedValue() };
  await inventory.execute(interaction);
  expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ ephemeral: true }));
});
