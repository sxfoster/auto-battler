const service = require('../src/utils/auctionHouseService');

jest.mock('../util/database', () => ({
  query: jest.fn()
}));
const db = require('../util/database');

describe('auctionHouseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createListing inserts listing', async () => {
    db.query.mockResolvedValueOnce([{ insertId: 10 }]);
    await service.createListing(1, 2, 3, 100);
    expect(db.query).toHaveBeenCalledWith(
      'INSERT INTO market_listings (seller_id, item_id, quantity, price) VALUES (?, ?, ?, ?)',
      [1, 2, 3, 100]
    );
  });

  test('getCheapestListings selects cheapest', async () => {
    db.query.mockResolvedValueOnce([[]]);
    await service.getCheapestListings(2, 5);
    expect(db.query).toHaveBeenCalledWith(
      'SELECT * FROM market_listings WHERE item_id = ? AND buyer_id IS NULL ORDER BY price ASC LIMIT ?',
      [2, 5]
    );
  });

  test('purchaseListing updates record', async () => {
    db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    await service.purchaseListing(7, 4);
    expect(db.query).toHaveBeenCalledWith(
      'UPDATE market_listings SET buyer_id = ?, purchased_at = NOW() WHERE id = ? AND buyer_id IS NULL',
      [4, 7]
    );
  });
});
