const db = require('../../util/database');

/**
 * Fetch a user record by Discord ID.
 * @param {string} discordId
 * @returns {Promise<object|undefined>} The player row or undefined.
 */
async function getUser(discordId) {
  const { rows } = await db.query('SELECT * FROM players WHERE discord_id = ?', [discordId]);
  return rows[0];
}

/**
 * Create a new user bound to a Discord account.
 * @param {string} discordId
 * @param {string} faction
 * @returns {Promise<number>} The inserted player id.
 */
async function createUser(discordId, faction) {
  const { insertId } = await db.query(
    'INSERT INTO players (discord_id, faction, name) VALUES (?, ?, ?)',
    [discordId, faction, discordId]
  );
  return insertId;
}

/**
 * Insert starting stats for a new player.
 * Each stat begins at 1 and the chosen bonusStat receives +1.
 *
 * @param {number} userId
 * @param {string} bonusStat One of 'MGT','AGI','FOR','INTU','RES','ING'.
 */
async function setInitialStats(userId, bonusStat) {
  const stats = ['MGT', 'AGI', 'FOR', 'INTU', 'RES', 'ING'];
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    for (const stat of stats) {
      const value = 1 + (stat === bonusStat ? 1 : 0);
      await conn.query(
        'INSERT INTO user_stats (player_id, stat, value) VALUES (?, ?, ?)',
        [userId, stat, value]
      );
    }
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { getUser, createUser, setInitialStats };
