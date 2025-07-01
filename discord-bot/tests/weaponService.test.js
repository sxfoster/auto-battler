const weaponService = require('../src/utils/weaponService');

jest.mock('../util/database', () => ({
  query: jest.fn().mockResolvedValue([{ insertId: 1 }])
}));
const db = require('../util/database');

describe('weaponService.addWeapon', () => {
  beforeEach(() => {
    db.query.mockClear();
  });

  test('inserts weapon instance for user', async () => {
    await weaponService.addWeapon(5, 12);
    expect(db.query).toHaveBeenCalledWith(
      'INSERT INTO user_weapons (user_id, weapon_id) VALUES (?, ?)',
      [5, 12]
    );
  });
});
