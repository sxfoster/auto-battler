const db = require('../../util/database');
const baseItems = require('../data/items');

const CATEGORY_MAP = {
  weapon: 'weapons',
  armor: 'armors',
  ability: 'abilities'
};

/**
 * Reduce durability on all equipped items for a player.
 * If an item has no durability column this call will no-op for that table.
 *
 * @param {number} playerId
 * @param {number} amount
 */
async function reduceDurability(playerId, amount) {
  const { rows } = await db.query(
    'SELECT equipped_weapon_id, equipped_armor_id, equipped_ability_id FROM players WHERE id = ?',
    [playerId]
  );
  if (rows.length === 0) return;

  const player = rows[0];
  const queries = [];

  if (player.equipped_weapon_id) {
    queries.push(
      db.query(
        'UPDATE user_weapons SET durability = GREATEST(durability - ?, 0) WHERE id = ?',
        [amount, player.equipped_weapon_id]
      )
    );
  }

  if (player.equipped_armor_id) {
    queries.push(
      db.query(
        'UPDATE user_armors SET durability = GREATEST(durability - ?, 0) WHERE id = ?',
        [amount, player.equipped_armor_id]
      )
    );
  }

  if (player.equipped_ability_id) {
    queries.push(
      db.query(
        'UPDATE user_ability_cards SET durability = GREATEST(durability - ?, 0) WHERE id = ?',
        [amount, player.equipped_ability_id]
      )
    );
  }

  await Promise.all(queries);
}

function getBaseItem(type, key) {
  const cat = CATEGORY_MAP[type];
  if (!cat) return null;
  return baseItems[cat][key] || null;
}

module.exports = { reduceDurability, getBaseItem };
