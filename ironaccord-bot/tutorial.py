from models import character_service

class TutorialView:
    async def run_phase_8(self, name: str, origin: str, skill: str) -> None:
        """Finalize the tutorial by persisting the player's character."""
        await character_service.insert_character(name, origin, skill)
