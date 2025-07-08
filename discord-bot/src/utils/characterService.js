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

const flagData = require('../data/flags');
const codexData = require('../data/codex');

/**
 * Aggregate all character information for display.
 *
 * @param {string} discordId Discord user id
 * @returns {Promise<object|undefined>} Character sheet or undefined if not found
 */
async function getCharacterSheet(discordId) {
  const { rows: playerRows } = await db.query(
    'SELECT id, level, equipped_weapon_id, equipped_armor_id, equipped_ability_id FROM players WHERE discord_id = ?',
    [discordId]
  );
  if (playerRows.length === 0) return undefined;

  const player = playerRows[0];
  const playerId = player.id;

  const [statRes, flagRes, codexRes] = await Promise.all([
    db.query('SELECT stat, value FROM user_stats WHERE player_id = ?', [playerId]),
    db.query('SELECT flag FROM user_flags WHERE player_id = ?', [playerId]),
    db.query('SELECT entry_key FROM codex_entries WHERE player_id = ?', [playerId])
  ]);

  const stats = { MGT: 0, AGI: 0, FOR: 0, INTU: 0, RES: 0, ING: 0 };
  for (const row of statRes.rows) {
    stats[row.stat] = row.value;
  }

  const flags = flagRes.rows.map(r => r.flag);
  const codex = codexRes.rows.map(r => r.entry_key);

  const [weaponRes, armorRes, abilityRes] = await Promise.all([
    player.equipped_weapon_id
      ? db.query('SELECT name FROM user_weapons WHERE id = ?', [player.equipped_weapon_id])
      : Promise.resolve({ rows: [] }),
    player.equipped_armor_id
      ? db.query('SELECT name FROM user_armors WHERE id = ?', [player.equipped_armor_id])
      : Promise.resolve({ rows: [] }),
    player.equipped_ability_id
      ? db.query('SELECT name FROM user_ability_cards WHERE id = ?', [player.equipped_ability_id])
      : Promise.resolve({ rows: [] })
  ]);

  for (const flag of flags) {
    const data = flagData[flag];
    if (data && data.statBonuses) {
      for (const [stat, bonus] of Object.entries(data.statBonuses)) {
        stats[stat] = (stats[stat] || 0) + bonus;
      }
    }
  }

  for (const entry of codex) {
    const data = codexData[entry];
    if (data && data.statBonuses) {
      for (const [stat, bonus] of Object.entries(data.statBonuses)) {
        stats[stat] = (stats[stat] || 0) + bonus;
      }
    }
  }

  const gear = {
    weapon: weaponRes.rows[0] ? weaponRes.rows[0].name : null,
    armor: armorRes.rows[0] ? armorRes.rows[0].name : null,
    ability: abilityRes.rows[0] ? abilityRes.rows[0].name : null
  };

  return { level: player.level, stats, gear, flags, codex };
}

module.exports = { getUser, createUser, setInitialStats, getCharacterSheet };
