const db = require('../../util/database');
const { allPossibleAbilities } = require('../../../backend/game/data');

async function createListing(sellerId, card, price) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query(
      'DELETE FROM user_ability_cards WHERE id = ? AND user_id = ?',
      [card.id, sellerId]
    );
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
        SELECT t1.*, u.name as seller_name FROM auction_house_listings t1
        INNER JOIN (
            SELECT ability_id, MIN(price) as min_price
            FROM auction_house_listings
            GROUP BY ability_id
        ) t2 ON t1.ability_id = t2.ability_id AND t1.price = t2.min_price
        INNER JOIN users u ON t1.seller_id = u.id
    `);
  return rows;
}

async function purchaseListing(buyerId, listingId, client) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [listingRows] = await connection.query('SELECT * FROM auction_house_listings WHERE id = ? FOR UPDATE', [listingId]);
    if (listingRows.length === 0) throw new Error('This item has already been sold.');
    const listing = listingRows[0];

    const [buyerRows] = await connection.query('SELECT gold, name FROM users WHERE id = ?', [buyerId]);
    if (buyerRows[0].gold < listing.price) throw new Error("You don't have enough gold.");
    const buyerName = buyerRows[0].name;

    await connection.query('UPDATE users SET gold = gold - ? WHERE id = ?', [listing.price, buyerId]);
    await connection.query('UPDATE users SET gold = gold + ? WHERE id = ?', [listing.price, listing.seller_id]);
    await connection.query('INSERT INTO user_ability_cards (user_id, ability_id, charges) VALUES (?, ?, ?)', [buyerId, listing.ability_id, listing.charges]);
    await connection.query('DELETE FROM auction_house_listings WHERE id = ?', [listingId]);

    await connection.commit();
    try {
      const [sellerUserRows] = await db.query('SELECT discord_id FROM users WHERE id = ?', [listing.seller_id]);
      if (sellerUserRows.length > 0) {
        const sellerDiscordId = sellerUserRows[0].discord_id;
        const seller = await client.users.fetch(sellerDiscordId);
        const ability = allPossibleAbilities.find(a => a.id === listing.ability_id);
        const abilityName = ability ? ability.name : `Ability ID ${listing.ability_id}`;
        await seller.send(`🎉 Your **${abilityName}** has sold to **${buyerName}** for **${listing.price} gold**! The gold has been added to your balance.`);
      }
    } catch (e) {
      console.error(`Failed to send sale notification to seller ID ${listing.seller_id}:`, e);
    }
    return listing;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { createListing, getCheapestListings, purchaseListing };
