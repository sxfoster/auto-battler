const db = require('../../util/database');
const playerService = require('./playerService');

const activeMissions = new Map();

async function getPlayerId(discordId) {
  const { rows } = await db.query('SELECT id FROM players WHERE discord_id = ?', [discordId]);
  return rows[0] ? rows[0].id : null;
}

async function startMission(playerId, missionId) {
  const { insertId } = await db.query(
    'INSERT INTO mission_log (mission_id, player_id) VALUES (?, ?)',
    [missionId, playerId]
  );
  activeMissions.set(insertId, { choices: [], durability: 3 });
  await playerService.setPlayerState(playerId, 'mission');
  return insertId;
}

function recordChoice(logId, roundIdx, choiceIdx, durabilityDelta = 0) {
  const m = activeMissions.get(logId);
  if (!m) return;
  m.choices[roundIdx] = choiceIdx;
  m.durability += durabilityDelta;
}

async function completeMission(logId, outcomeTier, rewards = {}, codexKey, playerId) {
  const m = activeMissions.get(logId) || { choices: [] };
  const log = JSON.stringify({ choices: m.choices, outcome_tier: outcomeTier });

  if (rewards.gold) {
    await db.query('UPDATE players SET gold = gold + ? WHERE id = ?', [rewards.gold, playerId]);
  }

  await db.query(
    'UPDATE mission_log SET status = ?, completed_at = NOW(), log = ? WHERE id = ?',
    ['completed', log, logId]
  );

  if (codexKey) {
    await db.query(
      'INSERT IGNORE INTO codex_entries (player_id, entry_key) VALUES (?, ?)',
      [playerId, codexKey]
    );
  }

  activeMissions.delete(logId);
  await playerService.setPlayerState(playerId, 'idle');
}

module.exports = { getPlayerId, startMission, recordChoice, completeMission };
