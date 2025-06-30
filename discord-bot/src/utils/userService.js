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

async function updateSettings(discordId, settings) {
  const columns = Object.keys(settings)
    .map(key => `${key} = ?`)
    .join(', ');
  const values = Object.values(settings);
  await db.query(`UPDATE users SET ${columns} WHERE discord_id = ?`, [...values, discordId]);
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
  updateSettings
};
