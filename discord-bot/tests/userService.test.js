const userService = require('../src/utils/userService');

jest.mock('../util/database', () => ({
  query: jest.fn().mockResolvedValue([])
}));

const db = require('../util/database');

describe('userService.addGold', () => {
  beforeEach(() => {
    db.query.mockClear();
  });

  test('increments user gold by amount', async () => {
    await userService.addGold(5, 10);
    expect(db.query).toHaveBeenCalledWith(
      'UPDATE users SET gold = gold + ? WHERE id = ?',
      [10, 5]
    );
  });

  test('no query when amount is zero', async () => {
    await userService.addGold(5, 0);
    expect(db.query).not.toHaveBeenCalled();
  });
});
