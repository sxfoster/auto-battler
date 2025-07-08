jest.mock('../util/database', () => ({ query: jest.fn() }));
const db = require('../util/database');

const { getCharacterSheet } = require('../src/utils/characterService');

beforeEach(() => {
  db.query.mockReset();
});

test('returns undefined when player missing', async () => {
  db.query.mockResolvedValueOnce({ rows: [] });
  const sheet = await getCharacterSheet('1');
  expect(sheet).toBeUndefined();
  expect(db.query).toHaveBeenCalledWith(
    'SELECT id, level, equipped_weapon_id, equipped_armor_id, equipped_ability_id FROM players WHERE discord_id = ?',
    ['1']
  );
});

test('aggregates data and applies bonuses', async () => {
  db.query
    .mockResolvedValueOnce({ rows: [{ id: 2, level: 1, equipped_weapon_id: 5, equipped_armor_id: null, equipped_ability_id: 6 }] })
    .mockResolvedValueOnce({ rows: [{ stat: 'MGT', value: 1 }, { stat: 'FOR', value: 1 }] })
    .mockResolvedValueOnce({ rows: [{ flag: 'Injured' }] })
    .mockResolvedValueOnce({ rows: [{ entry_key: 'ancient-tech' }] })
    .mockResolvedValueOnce({ rows: [{ name: 'Sword' }] })
    .mockResolvedValueOnce({ rows: [{ name: 'Fireball' }] });

  const sheet = await getCharacterSheet('user');

  expect(db.query).toHaveBeenCalledTimes(6);
  expect(sheet.level).toBe(1);
  expect(sheet.stats.MGT).toBe(1); // no bonuses
  expect(sheet.stats.FOR).toBe(0); // 1 base + (-1 flag)
  expect(sheet.stats.ING).toBe(2); // from codex
  expect(sheet.gear.weapon).toBe('Sword');
  expect(sheet.gear.ability).toBe('Fireball');
  expect(sheet.flags).toEqual(['Injured']);
  expect(sheet.codex).toEqual(['ancient-tech']);
});
