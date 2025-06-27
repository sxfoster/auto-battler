const db = require('../../util/database');

async function getUser(discordId) {
  const [rows] = await db.query('SELECT * FROM users WHERE discord_id = ?', [discordId]);
  return rows[0] || null;
}

async function createUser(discordId) {
  await db.query('INSERT INTO users (discord_id) VALUES (?)', [discordId]);
  return getUser(discordId);
}

async function setUserClass(discordId, className) {
  await db.query('UPDATE users SET class = ? WHERE discord_id = ?', [className, discordId]);
}

module.exports = { getUser, createUser, setUserClass };
