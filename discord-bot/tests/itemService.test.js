jest.mock('../util/database', () => ({ query: jest.fn() }));
const db = require('../util/database');

const { reduceDurability } = require('../src/services/itemService');

describe('itemService.reduceDurability', () => {
  beforeEach(() => {
    db.query.mockReset();
  });

  test('updates durability for all equipped items', async () => {
    db.query.mockResolvedValueOnce({ rows: [{
      equipped_weapon_id: 5,
      equipped_armor_id: 6,
      equipped_ability_id: 7
    }] });

    await reduceDurability(1, 10);

    expect(db.query).toHaveBeenNthCalledWith(
      1,
      'SELECT equipped_weapon_id, equipped_armor_id, equipped_ability_id FROM players WHERE id = ?',
      [1]
    );

    expect(db.query).toHaveBeenNthCalledWith(
      2,
      'UPDATE user_weapons SET durability = GREATEST(durability - ?, 0) WHERE id = ?',
      [10, 5]
    );
    expect(db.query).toHaveBeenNthCalledWith(
      3,
      'UPDATE user_armors SET durability = GREATEST(durability - ?, 0) WHERE id = ?',
      [10, 6]
    );
    expect(db.query).toHaveBeenNthCalledWith(
      4,
      'UPDATE user_ability_cards SET durability = GREATEST(durability - ?, 0) WHERE id = ?',
      [10, 7]
    );
  });
});
