const db = require('../../util/database');

/**
 * Store the player's initial stat selection.
 * @param {string} discordId - The ID of the Discord user.
 * @param {string[]} values - The values selected from the menu.
 */
async function setInitialStats(discordId, values) {
  const statsJson = JSON.stringify(values);
  // Persist selection in database if supported
  await db.query('UPDATE players SET starting_stats = ? WHERE discord_id = ?', [statsJson, discordId]);
}

module.exports = { setInitialStats };
