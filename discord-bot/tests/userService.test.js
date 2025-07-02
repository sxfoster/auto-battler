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

describe('userService.addXp', () => {
  beforeEach(() => {
    db.query.mockClear();
  });

  test('updates xp when below threshold', async () => {
    db.query
      .mockResolvedValueOnce([[{ id: 1, level: 1, xp: 0 }]])
      .mockResolvedValueOnce();

    const result = await userService.addXp(1, 10);
    expect(db.query).toHaveBeenNthCalledWith(1, 'SELECT id, level, xp FROM users WHERE id = ?', [1]);
    expect(db.query).toHaveBeenNthCalledWith(2, 'UPDATE users SET xp = ? WHERE id = ?', [10, 1]);
    expect(result).toEqual({ leveledUp: false, newLevel: 1 });
  });

  test('levels up when threshold reached', async () => {
    db.query
      .mockResolvedValueOnce([[{ id: 1, level: 1, xp: 4995 }]])
      .mockResolvedValueOnce();

    const result = await userService.addXp(1, 10);
    expect(db.query).toHaveBeenNthCalledWith(2, 'UPDATE users SET level = ?, xp = ? WHERE id = ?', [2, 5005, 1]);
    expect(result).toEqual({ leveledUp: true, newLevel: 2 });
  });

  test('no xp when at level cap', async () => {
    db.query.mockResolvedValueOnce([[{ id: 1, level: 10, xp: 135000 }]]);

    const result = await userService.addXp(1, 10);
    expect(db.query).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ leveledUp: false, newLevel: 10 });
  });
});
