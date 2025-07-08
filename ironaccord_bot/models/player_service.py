import json
from . import database as db

async def set_player_state(player_id: int, state: str) -> None:
    await db.query('UPDATE players SET state = %s WHERE id = %s', [state, player_id])

async def get_player_state(player_id: int) -> str | None:
    res = await db.query('SELECT state FROM players WHERE id = %s', [player_id])
    return res['rows'][0]['state'] if res['rows'] else None

async def store_stat_selection(discord_id: str, values: list[str]) -> None:
    stats_json = json.dumps(values)
    await db.query('UPDATE players SET starting_stats = %s WHERE discord_id = %s', [stats_json, discord_id])

