jest.mock('../util/database', () => ({ query: jest.fn() }));
jest.mock('../src/services/playerService', () => ({ setPlayerState: jest.fn() }));
const db = require('../util/database');
const playerService = require('../src/services/playerService');

const service = require('../src/services/missionService');

describe('missionService', () => {
  beforeEach(() => {
    db.query.mockReset();
    playerService.setPlayerState.mockReset();
  });

  test('startMission inserts log', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ insertId: 5 });
    const id = await service.startMission(1, 2);
    expect(db.query).toHaveBeenNthCalledWith(
      1,
      'SELECT id FROM mission_log WHERE player_id = ? AND status = ? LIMIT 1',
      [1, 'started']
    );
    expect(db.query).toHaveBeenNthCalledWith(
      2,
      'INSERT INTO mission_log (mission_id, player_id) VALUES (?, ?)',
      [2, 1]
    );
    expect(playerService.setPlayerState).toHaveBeenCalledWith(1, 'mission');
    expect(id).toBe(5);
  });

  test('startMission errors if one already started', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 7 }] });
    await expect(service.startMission(2, 3)).rejects.toThrow('Mission already started');
    expect(db.query).toHaveBeenCalledWith(
      'SELECT id FROM mission_log WHERE player_id = ? AND status = ? LIMIT 1',
      [2, 'started']
    );
  });

  test('completeMission updates log and rewards', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ insertId: 1 })
      .mockResolvedValue({});

    const logId = await service.startMission(1, 2);
    service.recordChoice(logId, 0, 1, -1);

    await service.completeMission(logId, 'success', { gold: 2 }, 'frag', 1);

    expect(db.query).toHaveBeenNthCalledWith(
      3,
      'UPDATE players SET gold = gold + ? WHERE id = ?',
      [2, 1]
    );
    const updateCall = db.query.mock.calls[3];
    expect(updateCall[0]).toMatch(/UPDATE mission_log/);
    const log = JSON.parse(updateCall[1][1]);
    expect(log.choices).toEqual([1]);
    expect(log.outcome_tier).toBe('success');
    expect(db.query).toHaveBeenNthCalledWith(
      5,
      'INSERT IGNORE INTO codex_entries (player_id, entry_key) VALUES (?, ?)',
      [1, 'frag']
    );
    expect(playerService.setPlayerState).toHaveBeenCalledWith(1, 'idle');
  });
});
