const db = require('../../util/database');
const { BY_NAME } = require('../data/items');

function rollD20() {
  return Math.floor(Math.random() * 20) + 1;
}

async function loadStats(playerId) {
  const { rows } = await db.query(
    'SELECT stat, value FROM user_stats WHERE player_id = ?',
    [playerId]
  );
  const stats = {};
  for (const row of rows) {
    stats[row.stat] = row.value;
  }
  return stats;
}

async function loadEquipped(playerId) {
  const { rows } = await db.query(
    'SELECT equipped_weapon_id, equipped_armor_id, equipped_ability_id FROM players WHERE id = ?',
    [playerId]
  );
  return rows[0] || {};
}

async function loadBonus(table, id) {
  if (!id) return 0;
  const { rows } = await db.query(`SELECT name FROM ${table} WHERE id = ?`, [id]);
  if (rows.length === 0) return 0;
  const item = BY_NAME[rows[0].name];
  return item && typeof item.bonus === 'number' ? item.bonus : 0;
}

/**
 * Resolve a player's mission choice.
 *
 * @param {number} playerId
 * @param {object} choice
 * @returns {Promise<{tier: string, rewards?: object, penalties?: object}>}
 */
async function resolveChoice(playerId, choice) {
  const stats = await loadStats(playerId);
  const equipped = await loadEquipped(playerId);

  const [weaponBonus, armorBonus, abilityBonus] = await Promise.all([
    loadBonus('user_weapons', equipped.equipped_weapon_id),
    loadBonus('user_armors', equipped.equipped_armor_id),
    loadBonus('user_ability_cards', equipped.equipped_ability_id)
  ]);
  const gearBonus = weaponBonus + armorBonus + abilityBonus;

  const statBonus = choice.stat ? stats[choice.stat] || 0 : 0;
  const roll = rollD20();
  const total = roll + statBonus + gearBonus;
  const dc = choice.dc || 10;

  let tier;
  if (roll === 1) tier = 'critical_fail';
  else if (roll === 20) tier = 'critical_success';
  else if (total >= dc) tier = 'success';
  else tier = 'fail';

  const result = { tier };
  if (choice.rewards && tier === 'success') result.rewards = choice.rewards;
  if (choice.penalties && tier === 'fail') result.penalties = choice.penalties;
  if (choice.outcomes && choice.outcomes[tier]) {
    const o = choice.outcomes[tier];
    if (o.rewards) result.rewards = o.rewards;
    if (o.penalties) result.penalties = o.penalties;
  }
  return result;
}

module.exports = { resolveChoice };
