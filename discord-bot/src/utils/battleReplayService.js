const db = require('../../util/database');

async function saveReplay(log) {
  const [result] = await db.query(
    'INSERT INTO battle_replays (battle_log) VALUES (?)',
    [JSON.stringify(log)]
  );
  return result.insertId;
}

async function getReplay(id) {
  const [rows] = await db.query('SELECT battle_log FROM battle_replays WHERE id = ?', [id]);
  return rows[0] ? rows[0].battle_log : null;
}

module.exports = { saveReplay, getReplay };
