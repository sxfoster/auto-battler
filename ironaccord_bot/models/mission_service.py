from typing import Dict, Any
import json

from . import database as db
from .player_service import set_player_state

_active_missions: Dict[int, Dict[str, Any]] = {}

async def get_player_id(discord_id: str) -> int | None:
    res = await db.query('SELECT id FROM players WHERE discord_id = %s', [discord_id])
    return res['rows'][0]['id'] if res['rows'] else None

async def start_mission(player_id: int, mission_id: int) -> int:
    check = await db.query(
        'SELECT id FROM mission_log WHERE player_id = %s AND status = %s LIMIT 1',
        [player_id, 'started']
    )
    if check['rows']:
        raise RuntimeError(f"Mission already started: {check['rows'][0]['id']}")

    res = await db.query(
        'INSERT INTO mission_log (mission_id, player_id) VALUES (%s, %s)',
        [mission_id, player_id]
    )
    log_id = res['insertId']
    _active_missions[log_id] = {'choices': [], 'durability': 3}
    await set_player_state(player_id, 'mission')
    return log_id

def record_choice(log_id: int, round_idx: int, choice_idx: int, durability_delta: int = 0) -> None:
    m = _active_missions.get(log_id)
    if not m:
        return
    m['choices'][round_idx] = choice_idx
    m['durability'] += durability_delta

async def complete_mission(log_id: int, outcome_tier: str, rewards: Dict[str, Any] | None, codex_key: str | None, player_id: int) -> None:
    m = _active_missions.get(log_id, {'choices': []})
    log = json.dumps({'choices': m['choices'], 'outcome_tier': outcome_tier})

    if rewards and rewards.get('gold'):
        await db.query('UPDATE players SET gold = gold + %s WHERE id = %s', [rewards['gold'], player_id])

    await db.query(
        'UPDATE mission_log SET status = %s, completed_at = NOW(), log = %s WHERE id = %s',
        ['completed', log, log_id]
    )

    if codex_key:
        await db.query('INSERT IGNORE INTO codex_entries (player_id, entry_key) VALUES (%s, %s)', [player_id, codex_key])

    _active_missions.pop(log_id, None)
    await set_player_state(player_id, 'idle')
