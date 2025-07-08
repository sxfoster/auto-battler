const db = require('../../util/database');

async function addFlag(playerId, flag) {
  await db.query(
    'INSERT INTO user_flags (player_id, flag) VALUES (?, ?)',
    [playerId, flag]
  );
}

async function addCodexFragment(playerId, fragment) {
  await db.query(
    'INSERT IGNORE INTO codex_entries (player_id, entry_key) VALUES (?, ?)',
    [playerId, fragment]
  );
}

module.exports = { addFlag, addCodexFragment };
