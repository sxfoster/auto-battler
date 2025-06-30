const db = require('../../util/database');
const abilityCards = require('./abilityCardService');
const { allPossibleAbilities } = require('../../../backend/game/data');

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

// Add an ability card to the user's inventory
async function addAbility(discordId, abilityId) {
  const user = await getUser(discordId);
  if (!user) return null;
  return abilityCards.addCard(user.id, abilityId);
}

async function incrementPveWin(userId) {
  await db.query('UPDATE users SET pve_wins = pve_wins + 1 WHERE id = ?', [userId]);
}

async function incrementPveLoss(userId) {
  await db.query('UPDATE users SET pve_losses = pve_losses + 1 WHERE id = ?', [userId]);
}

async function incrementPvpWin(userId) {
  await db.query('UPDATE users SET pvp_wins = pvp_wins + 1 WHERE id = ?', [userId]);
}

async function incrementPvpLoss(userId) {
  await db.query('UPDATE users SET pvp_losses = pvp_losses + 1 WHERE id = ?', [userId]);
}

// Add gold to the user by incrementing the gold column
async function addGold(userId, amount) {
  if (amount === 0) return;
  await db.query('UPDATE users SET gold = gold + ? WHERE id = ?', [amount, userId]);
}

async function getLeaderboardData() {
  const [rows] = await db.query(`
        SELECT
            name,
            discord_id,
            pve_wins, pve_losses,
            pvp_wins, pvp_losses,
            CASE WHEN pve_losses = 0 THEN pve_wins + 99999 ELSE pve_wins / pve_losses END AS pve_ratio,
            CASE WHEN pvp_losses = 0 THEN pvp_wins + 99999 ELSE pvp_wins / pvp_losses END AS pvp_ratio
        FROM users
    `);
  return rows;
}

// Retrieve the user's ability card inventory with names
async function getInventory(discordId) {
  const user = await getUser(discordId);
  if (!user) return [];
  const cards = await abilityCards.getCards(user.id);
  return cards.map(card => {
    const ability = allPossibleAbilities.find(a => a.id === card.ability_id);
    return {
      name: ability ? ability.name : `Ability ${card.ability_id}`,
      charges: card.charges,
      id: card.id
    };
  });
}

// Set which ability card is currently equipped
async function setActiveAbility(discordId, cardId) {
  const user = await getUser(discordId);
  if (!user) return null;
  await abilityCards.setEquippedCard(user.id, cardId);
  return { discordId, cardId };
}

async function markTutorialComplete(discordId) {
  await db.query('UPDATE users SET tutorial_completed = 1 WHERE discord_id = ?', [discordId]);
}

async function setDmPreference(discordId, preferenceKey, isEnabled) {
  const allowed = ['dm_battle_logs_enabled', 'dm_item_drops_enabled'];
  if (!allowed.includes(preferenceKey)) {
    throw new Error('Invalid preference key');
  }
  const value = isEnabled ? 1 : 0;
  await db.query(`UPDATE users SET ${preferenceKey} = ? WHERE discord_id = ?`, [value, discordId]);
}

module.exports = {
  getUser,
  createUser,
  getUserByName,
  setUserClass,
  addAbility,
  getInventory,
  setActiveAbility,
  markTutorialComplete,
  setDmPreference,
  incrementPveWin,
  incrementPveLoss,
  incrementPvpWin,
  incrementPvpLoss,
  addGold,
  getLeaderboardData
};
