const db = require('../util/database');
jest.mock('../util/database', () => ({ query: jest.fn() }));

const { setInitialStats } = require('../src/services/playerService');

test('setInitialStats updates player stats', async () => {
  await setInitialStats('123', ['str']);
  expect(db.query).toHaveBeenCalledWith(
    'UPDATE players SET starting_stats = ? WHERE discord_id = ?',
    [JSON.stringify(['str']), '123']
  );
});
