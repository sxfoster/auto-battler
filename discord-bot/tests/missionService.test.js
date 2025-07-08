jest.mock('../util/database', () => ({ query: jest.fn() }));
const db = require('../util/database');

const service = require('../src/services/missionService');

describe('missionService', () => {
  beforeEach(() => { db.query.mockReset(); });

  test('startMission inserts log', async () => {
    db.query.mockResolvedValueOnce({ insertId: 5 });
    const id = await service.startMission(1, 2);
    expect(db.query).toHaveBeenCalledWith(
      'INSERT INTO mission_log (mission_id, player_id) VALUES (?, ?)',
      [2, 1]
    );
    expect(id).toBe(5);
  });

  test('completeMission updates log and rewards', async () => {
    db.query
      .mockResolvedValueOnce({ insertId: 1 })
      .mockResolvedValue({});

    const logId = await service.startMission(1, 2);
    service.recordChoice(logId, 0, 1, -1);

    await service.completeMission(logId, 'success', { gold: 2 }, 'frag', 1);

    expect(db.query).toHaveBeenNthCalledWith(
      2,
      'UPDATE players SET gold = gold + ? WHERE id = ?',
      [2, 1]
    );
    const updateCall = db.query.mock.calls[2];
    expect(updateCall[0]).toMatch(/UPDATE mission_log/);
    const log = JSON.parse(updateCall[1][1]);
    expect(log.choices).toEqual([1]);
    expect(log.outcome_tier).toBe('success');
    expect(db.query).toHaveBeenNthCalledWith(
      4,
      'INSERT IGNORE INTO codex_entries (player_id, entry_key) VALUES (?, ?)',
      [1, 'frag']
    );
  });
});
