const db = require('../../util/database');
const itemService = require('../services/itemService');
const userService = require('../services/userService');

/**
 * Apply the outcome of a mission choice to the player's data.
 *
 * @param {number} playerId
 * @param {object} result Result from missionEngine.resolveChoice
 */
async function applyChoiceResults(playerId, result) {
  const tasks = [];

  if (result.penalties) {
    const { durability_loss, add_flag } = result.penalties;
    if (durability_loss) {
      tasks.push(itemService.reduceDurability(playerId, durability_loss));
    }
    if (add_flag) {
      const flags = Array.isArray(add_flag) ? add_flag : [add_flag];
      for (const flag of flags) {
        tasks.push(userService.addFlag(playerId, flag));
      }
    }
  }

  if (result.rewards) {
    const { items, codex } = result.rewards;
    if (Array.isArray(items)) {
      for (const item of items) {
        if (!item || !item.type || !item.name) continue;
        let table;
        if (item.type === 'weapon') table = 'user_weapons';
        else if (item.type === 'armor') table = 'user_armors';
        else if (item.type === 'ability') table = 'user_ability_cards';
        else continue;
        tasks.push(
          db.query(`INSERT INTO ${table} (player_id, name) VALUES (?, ?)`, [playerId, item.name])
        );
      }
    }
    if (codex) {
      const fragments = Array.isArray(codex) ? codex : [codex];
      for (const frag of fragments) {
        tasks.push(
          db.query('INSERT IGNORE INTO codex_entries (player_id, entry_key) VALUES (?, ?)', [playerId, frag])
        );
      }
    }
  }

  await Promise.all(tasks);
}

module.exports = { applyChoiceResults };
