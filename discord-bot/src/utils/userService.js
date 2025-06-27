const db = require('../../util/database');

async function getUser(discordId) {
  const [rows] = await db.query('SELECT * FROM users WHERE discord_id = ?', [discordId]);
  return rows[0] || null;
}

async function createUser(discordId, name) {
  await db.query('INSERT INTO users (discord_id, name) VALUES (?, ?)', [discordId, name]);
  return getUser(discordId);
}

async function getUserByName(name) {
  const [rows] = await db.query('SELECT * FROM users WHERE LOWER(name) = LOWER(?)', [name]);
  return rows[0] || null;
}

async function setUserClass(discordId, className) {
  await db.query('UPDATE users SET class = ? WHERE discord_id = ?', [className, discordId]);
}

module.exports = { getUser, createUser, getUserByName, setUserClass };
