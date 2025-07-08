const db = require('../../util/database');

/**
 * Persist a player's selected starting stats.
 *
 * @param {string} discordId The ID of the Discord user.
 * @param {string[]} values The values selected from the menu.
 */
async function storeStatSelection(discordId, values) {
  const statsJson = JSON.stringify(values);
  // Persist selection in database if supported
  await db.query('UPDATE players SET starting_stats = ? WHERE discord_id = ?', [
    statsJson,
    discordId
  ]);
}

async function getPlayerState(playerId) {
  const { rows } = await db.query('SELECT state FROM players WHERE id = ?', [playerId]);
  return rows[0] ? rows[0].state : null;
}

async function setPlayerState(playerId, state) {
  await db.query('UPDATE players SET state = ? WHERE id = ?', [state, playerId]);
}

module.exports = { storeStatSelection, getPlayerState, setPlayerState };
