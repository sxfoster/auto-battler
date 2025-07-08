from . import database as db

async def set_player_state(player_id: int, state: str) -> None:
    await db.query('UPDATE players SET state = %s WHERE id = %s', [state, player_id])

async def get_player_state(player_id: int) -> str | None:
    res = await db.query('SELECT state FROM players WHERE id = %s', [player_id])
    return res['rows'][0]['state'] if res['rows'] else None


