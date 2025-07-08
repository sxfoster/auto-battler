const db = require('../../util/database');

async function reduceDurability(itemId, amount) {
  await db.query(
    'UPDATE user_items SET durability = GREATEST(durability - ?, 0) WHERE id = ?',
    [amount, itemId]
  );
}

async function addItem(playerId, itemName) {
  await db.query(
    'INSERT INTO user_items (player_id, name) VALUES (?, ?)',
    [playerId, itemName]
  );
}

module.exports = { reduceDurability, addItem };
