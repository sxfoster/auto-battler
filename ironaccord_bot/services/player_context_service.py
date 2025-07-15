"""Helpers to gather a player's current context from the database."""

from typing import Any, Dict

from ironaccord_bot.models import mission_service, database


async def gather_player_context(discord_id: str) -> Dict[str, Any] | None:
    """Collect stats and other info used for mission generation."""
    player_id = await mission_service.get_player_id(discord_id)
    if not player_id:
        return None

    res = await database.query(
        "SELECT level, background, location FROM players WHERE id = %s",
        [player_id],
    )
    row = res["rows"][0] if res["rows"] else {}
    level = row.get("level", 1)
    background = row.get("background")
    location = row.get("location")

    stats_res = await database.query(
        "SELECT stat, value FROM user_stats WHERE player_id = %s",
        [player_id],
    )
    stats = {row["stat"]: row["value"] for row in stats_res["rows"]}

    codex_res = await database.query(
        "SELECT entry_key FROM codex_entries WHERE player_id = %s",
        [player_id],
    )
    codex = [r["entry_key"] for r in codex_res["rows"]]

    flags_res = await database.query(
        "SELECT flag FROM user_flags WHERE player_id = %s",
        [player_id],
    )
    flags = [r["flag"] for r in flags_res["rows"]]

    context = {"level": level, "stats": stats, "codex": codex}
    if background:
        context["background"] = background
    if location:
        context["location"] = location
    if flags:
        context["flags"] = flags
    return context
