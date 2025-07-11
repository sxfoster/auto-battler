"""Utility functions for player data."""

import logging

logger = logging.getLogger(__name__)

# Database functionality has been removed as part of the stateless refactor.
# These functions now simply log their usage.

async def set_player_state(player_id: int, state: str) -> None:
    """Previously persisted the player's state. Now logs the request."""
    logger.info("set_player_state called for id=%s state=%s", player_id, state)

async def get_player_state(player_id: int) -> str | None:
    """Return None as no state is stored."""
    logger.info("get_player_state called for id=%s", player_id)
    return None


async def store_faction(discord_id: str, faction: str) -> None:
    """Previously stored the player's faction. Now logs the request."""
    logger.info("store_faction called for discord_id=%s faction=%s", discord_id, faction)

