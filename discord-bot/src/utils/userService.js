const db = require('../../util/database');
const abilityCards = require('./abilityCardService');
const gameData = require('../../util/gameData');

function getAllAbilities() {
  return Array.from(gameData.gameData.abilities.values());
}

// XP required to reach each level
const XP_THRESHOLDS = {
  1: 5000,
  2: 12500,
  3: 22500,
  4: 35000,
  5: 50000,
  6: 67500,
  7: 87500,
  8: 110000,
  9: 135000,
  10: Infinity // Level cap
};

async function getUser(discordId) {
  const { rows } = await db.query('SELECT * FROM users WHERE discord_id = ?', [discordId]);
  return rows[0] || null;
}

async function createUser(discordId, name) {
  await db.query('INSERT INTO users (discord_id, name) VALUES (?, ?)', [discordId, name]);
  return getUser(discordId);
}

async function getUserByName(name) {
  const { rows } = await db.query('SELECT * FROM users WHERE LOWER(name) = LOWER(?)', [name]);
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

// Award XP and handle level ups
async function addXp(userId, amount) {
  const { rows } = await db.query('SELECT id, level, xp FROM users WHERE id = ?', [userId]);
  const user = rows[0];
  if (!user) return null;
  if (user.level >= 10) {
    return { leveledUp: false, newLevel: user.level };
  }

  const newXp = user.xp + amount;
  let newLevel = user.level;
  let leveledUp = false;

  if (newXp >= XP_THRESHOLDS[user.level]) {
    newLevel++;
    leveledUp = true;
    await db.query('UPDATE users SET level = ?, xp = ? WHERE id = ?', [newLevel, newXp, user.id]);
  } else {
    await db.query('UPDATE users SET xp = ? WHERE id = ?', [newXp, user.id]);
  }

  return { leveledUp, newLevel };
}

async function getLeaderboardData() {
  const { rows } = await db.query(`
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
    const ability = getAllAbilities().find(a => a.id === card.ability_id);
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

// ------ State Management ------

async function getUserState(discordId) {
  const { rows } = await db.query(
    'SELECT state, location, tutorial_step FROM users WHERE discord_id = ?',
    [discordId]
  );
  return rows[0] || null;
}

async function setUserState(discordId, newState) {
  await db.query('UPDATE users SET state = ? WHERE discord_id = ?', [newState, discordId]);
}

async function setUserLocation(discordId, newLocation) {
  await db.query('UPDATE users SET location = ? WHERE discord_id = ?', [newLocation, discordId]);
}

async function setTutorialStep(discordId, newStep) {
  await db.query('UPDATE users SET tutorial_step = ? WHERE discord_id = ?', [newStep, discordId]);
}

async function completeTutorial(discordId) {
  await db.query(
    "UPDATE users SET tutorial_completed = 1, state = 'active', location = 'town', tutorial_step = 'complete' WHERE discord_id = ?",
    [discordId]
  );
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

async function setLogVerbosity(discordId, verbosity) {
  const allowed = ['summary', 'detailed', 'combat_only'];
  if (!allowed.includes(verbosity)) {
    throw new Error('Invalid verbosity');
  }
  await db.query('UPDATE users SET log_verbosity = ? WHERE discord_id = ?', [verbosity, discordId]);
}

module.exports = {
  XP_THRESHOLDS,
  getUser,
  createUser,
  getUserByName,
  setUserClass,
  addAbility,
  getInventory,
  setActiveAbility,
  getUserState,
  setUserState,
  setUserLocation,
  setTutorialStep,
  completeTutorial,
  markTutorialComplete,
  setDmPreference,
  setLogVerbosity,
  incrementPveWin,
  incrementPveLoss,
  incrementPvpWin,
  incrementPvpLoss,
  addGold,
  addXp,
  getLeaderboardData
};
