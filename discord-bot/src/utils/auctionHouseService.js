const db = require('../../util/database');

async function createListing(userId, cardId, price) {
  const [result] = await db.query(
    'INSERT INTO market_listings (seller_id, card_id, price) VALUES (?, ?, ?)',
    [userId, cardId, price]
  );
  return result.insertId;
}

module.exports = { createListing };
