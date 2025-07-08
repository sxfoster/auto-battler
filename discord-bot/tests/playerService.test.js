jest.mock('../util/database', () => ({ query: jest.fn() }));
const db = require('../util/database');

const { storeStatSelection } = require('../src/services/playerService');

test('storeStatSelection updates player stats', async () => {
  await storeStatSelection('123', ['str']);
  expect(db.query).toHaveBeenCalledWith(
    'UPDATE players SET starting_stats = ? WHERE discord_id = ?',
    [JSON.stringify(['str']), '123']
  );
});
