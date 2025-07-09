from services.ollama_service import OllamaService


class AIAgent:
    """
    The main AI agent for the bot.
    This class acts as a bridge between the bot's cogs and the Ollama service.
    It formats prompts and directs them to the correct model (Narrator or GM).
    """

    def __init__(self, world_bible_path: str = "docs/iron_accord_lore_gdd.md"):
        """Initializes the AIAgent."""
        self.ollama_service = OllamaService()
        self.world_bible = self._load_world_bible(world_bible_path)

    def _load_world_bible(self, path: str) -> str:
        """Load the world bible content from a file."""
        try:
            with open(path, "r", encoding="utf-8") as f:
                return f.read()
        except FileNotFoundError:
            # If the main lore is missing, use a fallback.
            return (
                "The world is a grim, dark, post-apocalyptic wasteland. Resources are scarce. "
                "Survival is paramount."
            )
        except Exception as e:  # pragma: no cover - unexpected
            print(f"Error loading world bible: {e}")
            return "Error: Could not load world bible."

    async def get_narrative(self, prompt: str) -> str:
        """Generate a narrative response using the creative model."""
        full_prompt = f"WORLD CONTEXT:\n{self.world_bible}\n\nSTORY PROMPT:\n{prompt}"
        return await self.ollama_service.get_narrative(full_prompt)

    async def get_gm_response(self, prompt: str) -> str:
        """Generate a logical response from the fast GM model."""
        return await self.ollama_service.get_gm_response(prompt)

