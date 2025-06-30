const db = require('../../util/database');

async function createListing(sellerId, itemId, quantity, price) {
  const [result] = await db.query(
    'INSERT INTO market_listings (seller_id, item_id, quantity, price) VALUES (?, ?, ?, ?)',
    [sellerId, itemId, quantity, price]
  );
  return result.insertId;
}

async function getCheapestListings(itemId, limit = 5) {
  const [rows] = await db.query(
    'SELECT * FROM market_listings WHERE item_id = ? AND buyer_id IS NULL ORDER BY price ASC LIMIT ?',
    [itemId, limit]
  );
  return rows;
}

async function purchaseListing(listingId, buyerId) {
  const [result] = await db.query(
    'UPDATE market_listings SET buyer_id = ?, purchased_at = NOW() WHERE id = ? AND buyer_id IS NULL',
    [buyerId, listingId]
  );
  return result.affectedRows > 0;
}

module.exports = { createListing, getCheapestListings, purchaseListing };
