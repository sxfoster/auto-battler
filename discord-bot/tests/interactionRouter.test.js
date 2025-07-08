jest.mock('../util/database', () => ({ query: jest.fn() }));
jest.mock('../src/services/itemService', () => ({
  reduceDurability: jest.fn(),
  getBaseItem: jest.fn()
}));
jest.mock('../src/services/userService', () => ({ addFlag: jest.fn() }));

const db = require('../util/database');
const itemService = require('../src/services/itemService');
const userService = require('../src/services/userService');
const { applyChoiceResults } = require('../src/utils/interactionRouter');

describe('interactionRouter.applyChoiceResults', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    db.query.mockResolvedValue({});
  });

  test('applies durability loss and flag penalties', async () => {
    await applyChoiceResults(1, { penalties: { durability_loss: 5, add_flag: 'Injured' } });

    expect(itemService.reduceDurability).toHaveBeenCalledWith(1, 5);
    expect(userService.addFlag).toHaveBeenCalledWith(1, 'Injured');
  });

  test('adds loot items and codex fragments', async () => {
    itemService.getBaseItem.mockImplementation((type, key) => {
      if (key === 'sword') return { name: 'Sword' };
      if (key === 'fireball') return { name: 'Fireball' };
      return null;
    });

    await applyChoiceResults(2, {
      rewards: {
        items: [
          { type: 'weapon', key: 'sword' },
          { type: 'ability', key: 'fireball' }
        ],
        codex: 'frag1'
      }
    });

    expect(db.query).toHaveBeenNthCalledWith(
      1,
      'INSERT INTO user_weapons (player_id, name) VALUES (?, ?)',
      [2, 'Sword']
    );
    expect(db.query).toHaveBeenNthCalledWith(
      2,
      'INSERT INTO user_ability_cards (player_id, name) VALUES (?, ?)',
      [2, 'Fireball']
    );
    expect(db.query).toHaveBeenNthCalledWith(
      3,
      'INSERT IGNORE INTO codex_entries (player_id, entry_key) VALUES (?, ?)',
      [2, 'frag1']
    );
  });
});
