jest.mock('../util/database', () => ({ query: jest.fn() }));
const db = require('../util/database');
const { resolveChoice } = require('../src/utils/missionEngine');

describe('missionEngine.resolveChoice', () => {
  beforeEach(() => {
    db.query.mockReset();
    jest.spyOn(Math, 'random').mockReturnValue(0.5); // roll 11
  });

  afterEach(() => {
    Math.random.mockRestore();
  });

  test('applies stats and gear bonuses', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ stat: 'MGT', value: 3 }] })
      .mockResolvedValueOnce({ rows: [{ equipped_weapon_id: 2, equipped_armor_id: 3, equipped_ability_id: null }] })
      .mockResolvedValueOnce({ rows: [{ bonus: 1 }] })
      .mockResolvedValueOnce({ rows: [{ bonus: 2 }] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await resolveChoice(1, { dc: 15, stat: 'MGT', rewards: { gold: 2 } });

    expect(db.query).toHaveBeenNthCalledWith(1, 'SELECT stat, value FROM user_stats WHERE player_id = ?', [1]);
    expect(db.query).toHaveBeenNthCalledWith(2, 'SELECT equipped_weapon_id, equipped_armor_id, equipped_ability_id FROM players WHERE id = ?', [1]);
    expect(db.query).toHaveBeenNthCalledWith(3, 'SELECT bonus FROM user_weapons WHERE id = ?', [2]);
    expect(db.query).toHaveBeenNthCalledWith(4, 'SELECT bonus FROM user_armors WHERE id = ?', [3]);
    expect(res.tier).toBe('success');
    expect(res.rewards).toEqual({ gold: 2 });
  });
});
