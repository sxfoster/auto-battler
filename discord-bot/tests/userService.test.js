jest.mock('../util/database', () => ({ query: jest.fn() }));
const db = require('../util/database');

const { addFlag } = require('../src/services/userService');

describe('userService.addFlag', () => {
  beforeEach(() => {
    db.query.mockReset();
  });

  test('inserts flag for player', async () => {
    await addFlag(2, 'weary');
    expect(db.query).toHaveBeenCalledWith(
      'INSERT IGNORE INTO player_flags (player_id, flag) VALUES (?, ?)',
      [2, 'weary']
    );
  });
});
