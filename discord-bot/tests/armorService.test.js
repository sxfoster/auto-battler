const armorService = require('../src/utils/armorService');

jest.mock('../util/database', () => ({
  query: jest.fn().mockResolvedValue([{ insertId: 1 }])
}));
const db = require('../util/database');

describe('armorService.addArmor', () => {
  beforeEach(() => {
    db.query.mockClear();
  });

  test('inserts armor instance for user', async () => {
    await armorService.addArmor(5, 12);
    expect(db.query).toHaveBeenCalledWith(
      'INSERT INTO user_armors (user_id, armor_id) VALUES (?, ?)',
      [5, 12]
    );
  });
});
