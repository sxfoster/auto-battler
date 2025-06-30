const db = require('../../util/database');

async function createListing(sellerId, card, price) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('DELETE FROM user_ability_cards WHERE id = ?', [card.id]);
    await connection.query(
      'INSERT INTO auction_house_listings (seller_id, ability_id, charges, price) VALUES (?, ?, ?, ?)',
      [sellerId, card.ability_id, card.charges, price]
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function getCheapestListings() {
  const [rows] = await db.query(`
        SELECT t1.* FROM auction_house_listings t1
        INNER JOIN (
            SELECT ability_id, MIN(price) as min_price
            FROM auction_house_listings
            GROUP BY ability_id
        ) t2 ON t1.ability_id = t2.ability_id AND t1.price = t2.min_price
    `);
  return rows;
}

async function purchaseListing(buyerId, listingId) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [listingRows] = await connection.query('SELECT * FROM auction_house_listings WHERE id = ? FOR UPDATE', [listingId]);
    if (listingRows.length === 0) throw new Error('This item has already been sold.');
    const listing = listingRows[0];

    const [buyerRows] = await connection.query('SELECT gold FROM users WHERE id = ?', [buyerId]);
    if (buyerRows[0].gold < listing.price) throw new Error("You don't have enough gold.");

    await connection.query('UPDATE users SET gold = gold - ? WHERE id = ?', [listing.price, buyerId]);
    await connection.query('UPDATE users SET gold = gold + ? WHERE id = ?', [listing.price, listing.seller_id]);
    await connection.query('INSERT INTO user_ability_cards (user_id, ability_id, charges) VALUES (?, ?, ?)', [buyerId, listing.ability_id, listing.charges]);
    await connection.query('DELETE FROM auction_house_listings WHERE id = ?', [listingId]);

    await connection.commit();
    return listing;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { createListing, getCheapestListings, purchaseListing };
