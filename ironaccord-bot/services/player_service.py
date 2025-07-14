class PlayerService:
    """
    Manages the state and data for all players in the game.
    For now, it uses a simple in-memory dictionary.
    """
    def __init__(self):
        # A dictionary to store player data, keyed by Discord user ID.
        # Example: { 123456789: {"status": "Idle"} }
        self._players = {}

    def _get_or_create_player(self, user_id: int):
        """Ensures a player entry exists, creating one if not."""
        if user_id not in self._players:
            self._players[user_id] = {"status": "Idle"}
        return self._players[user_id]

    def get_player_status(self, user_id: int) -> str:
        """Gets the current status for a given player."""
        player = self._get_or_create_player(user_id)
        return player.get("status", "Idle")

    def set_player_status(self, user_id: int, status: str):
        """Sets the status for a given player."""
        player = self._get_or_create_player(user_id)
        player["status"] = status
        print(f"Updated status for player {user_id} to '{status}'")
