const db = require('../../util/database');

/**
 * Add a status flag to a player if it is not already present.
 *
 * @param {number} playerId
 * @param {string} flag
 */
async function addFlag(playerId, flag) {
  await db.query(
    'INSERT IGNORE INTO player_flags (player_id, flag) VALUES (?, ?)',
    [playerId, flag]
  );
}

module.exports = { addFlag };
