const abilityCardService = require('../src/utils/abilityCardService');

jest.mock('../util/database', () => ({
  query: jest.fn().mockResolvedValue([])
}));
const db = require('../util/database');

describe('abilityCardService.setEquippedCard', () => {
  beforeEach(() => {
    db.query.mockClear();
  });

  test('updates equipped card only if card belongs to user', async () => {
    await abilityCardService.setEquippedCard(5, 10);
    expect(db.query).toHaveBeenCalledWith(
      `UPDATE users
     SET equipped_ability_id = ?
     WHERE id = ? AND EXISTS (
       SELECT 1 FROM user_ability_cards
       WHERE id = ? AND user_id = ?
     )`,
      [10, 5, 10, 5]
    );
  });
});
