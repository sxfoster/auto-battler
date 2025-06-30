const db = require('../../util/database');

async function getCheapestListings(limit = 5) {
  const [rows] = await db.query(
    `SELECT ml.id, ml.card_id, ml.price, u.name AS seller_name, u.discord_id AS seller_discord_id
     FROM market_listings ml
     JOIN users u ON ml.seller_id = u.id
     WHERE ml.sold = 0
     ORDER BY ml.price ASC
     LIMIT ?`,
    [limit]
  );
  return rows;
}

async function purchaseListing(listingId, buyerDiscordId) {
  const [listRows] = await db.query('SELECT * FROM market_listings WHERE id = ?', [listingId]);
  const listing = listRows[0];
  if (!listing || listing.sold) {
    throw new Error('Listing already sold');
  }
  const [buyerRows] = await db.query('SELECT * FROM users WHERE discord_id = ?', [buyerDiscordId]);
  const buyer = buyerRows[0];
  if (!buyer) throw new Error('Buyer not found');
  if (buyer.gold < listing.price) {
    throw new Error('Insufficient funds');
  }
  const [sellerRows] = await db.query('SELECT * FROM users WHERE id = ?', [listing.seller_id]);
  const seller = sellerRows[0];
  if (!seller) throw new Error('Seller not found');

  await db.query('UPDATE users SET gold = gold - ? WHERE id = ?', [listing.price, buyer.id]);
  await db.query('UPDATE users SET gold = gold + ? WHERE id = ?', [listing.price, seller.id]);
  await db.query('UPDATE user_ability_cards SET user_id = ? WHERE id = ?', [buyer.id, listing.card_id]);
  await db.query('UPDATE market_listings SET sold = 1, buyer_id = ? WHERE id = ?', [buyer.id, listingId]);

  return { buyer, seller, listing };
}

module.exports = { getCheapestListings, purchaseListing };
