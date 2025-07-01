const service = require('../src/utils/auctionHouseService');

jest.mock('../util/database', () => ({
  query: jest.fn(),
  getConnection: jest.fn()
}));
const db = require('../util/database');

describe('auctionHouseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createListing removes card and creates listing inside transaction', async () => {
    const connection = {
      beginTransaction: jest.fn(),
      query: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      release: jest.fn()
    };
    db.getConnection.mockResolvedValue(connection);

    await service.createListing(1, { id: 5, ability_id: 2, charges: 7 }, 100);

    expect(connection.beginTransaction).toHaveBeenCalled();
    expect(connection.query).toHaveBeenNthCalledWith(
      1,
      'DELETE FROM user_ability_cards WHERE id = ? AND user_id = ?',
      [5, 1]
    );
    expect(connection.query).toHaveBeenNthCalledWith(
      2,
      'INSERT INTO auction_house_listings (seller_id, ability_id, charges, price) VALUES (?, ?, ?, ?)',
      [1, 2, 7, 100]
    );
    expect(connection.commit).toHaveBeenCalled();
    expect(connection.release).toHaveBeenCalled();
  });

  test('getCheapestListings selects grouped cheapest', async () => {
    db.query.mockResolvedValueOnce([[]]);
    await service.getCheapestListings();
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('auction_house_listings'));
  });

  test('purchaseListing transfers gold and card', async () => {
    const connection = {
      beginTransaction: jest.fn(),
      query: jest.fn()
        .mockResolvedValueOnce([[{ id: 9, seller_id: 2, ability_id: 3, charges: 5, price: 20 }]])
        .mockResolvedValueOnce([[{ gold: 50 }]])
        .mockResolvedValue({}),
      commit: jest.fn(),
      rollback: jest.fn(),
      release: jest.fn()
    };
    db.getConnection.mockResolvedValue(connection);

    await service.purchaseListing(1, 9);

    expect(connection.beginTransaction).toHaveBeenCalled();
    expect(connection.query).toHaveBeenNthCalledWith(1, 'SELECT * FROM auction_house_listings WHERE id = ? FOR UPDATE', [9]);
    expect(connection.commit).toHaveBeenCalled();
    expect(connection.release).toHaveBeenCalled();
  });
});
