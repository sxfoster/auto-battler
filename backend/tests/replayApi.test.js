const request = require('supertest');

jest.mock('../../discord-bot/util/database', () => ({
  query: jest.fn(),
}));

const db = require('../../discord-bot/util/database');
const app = require('../index');

describe('GET /api/replays/:id', () => {
  beforeEach(() => {
    db.query.mockReset();
  });

  test('returns battle log when replay exists', async () => {
    const log = { turns: [] };
    db.query.mockResolvedValue([[{ battle_log: log }]]);
    const res = await request(app).get('/api/replays/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(log);
    expect(db.query).toHaveBeenCalledWith(
      'SELECT battle_log FROM battle_replays WHERE id = ?',
      ['1']
    );
  });

  test('returns 404 when replay does not exist', async () => {
    db.query.mockResolvedValue([[]]);
    const res = await request(app).get('/api/replays/999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Not Found' });
  });
});
