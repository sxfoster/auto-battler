jest.mock('../util/database', () => ({ query: jest.fn() }));
const db = require('../util/database');

const { storeStatSelection, getPlayerState, setPlayerState } = require('../src/services/playerService');

test('storeStatSelection updates player stats', async () => {
  await storeStatSelection('123', ['str']);
  expect(db.query).toHaveBeenCalledWith(
    'UPDATE players SET starting_stats = ? WHERE discord_id = ?',
    [JSON.stringify(['str']), '123']
  );
});

test('getPlayerState queries state', async () => {
  db.query.mockResolvedValueOnce({ rows: [{ state: 'idle' }] });
  const state = await getPlayerState(1);
  expect(db.query).toHaveBeenCalledWith('SELECT state FROM players WHERE id = ?', [1]);
  expect(state).toBe('idle');
});

test('setPlayerState updates state', async () => {
  await setPlayerState(2, 'mission');
  expect(db.query).toHaveBeenCalledWith('UPDATE players SET state = ? WHERE id = ?', ['mission', 2]);
});
