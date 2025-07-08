jest.mock('../util/database', () => ({ query: jest.fn() }));
const db = require('../util/database');
const inventory = require('../commands/inventory');

describe('inventory command', () => {
  beforeEach(() => {
    db.query.mockReset();
  });

  test('shows equipped items', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 1, equipped_weapon_id: 2, equipped_armor_id: 3, equipped_ability_id: 4 }] })
      .mockResolvedValueOnce({ rows: [{ id: 2, name: 'Sword' }] })
      .mockResolvedValueOnce({ rows: [{ id: 3, name: 'Leather' }] })
      .mockResolvedValueOnce({ rows: [{ id: 4, name: 'Fireball' }] });

    const interaction = { user: { id: '123' }, reply: jest.fn().mockResolvedValue() };

    await inventory.execute(interaction);

    expect(db.query).toHaveBeenCalledTimes(4);
    expect(interaction.reply).toHaveBeenCalled();
  });
});
