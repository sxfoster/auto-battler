from services.ollama_service import OllamaService

class AIAgent:
    """Main AI agent bridging cogs with the Ollama service."""

    def __init__(self, world_bible_path: str = "docs/iron_accord_lore_gdd.md"):
        """Initialize the agent and load world context."""
        self.ollama_service = OllamaService()
        self.world_bible = self._load_world_bible(world_bible_path)

    def _load_world_bible(self, path: str) -> str:
        """Return the contents of the world bible file."""
        try:
            with open(path, "r", encoding="utf-8") as f:
                return f.read()
        except FileNotFoundError:
            return (
                "The world is a grim, dark, post-apocalyptic wasteland. Resources are scarce. "
                "Survival is paramount."
            )
        except Exception as e:  # pragma: no cover - unexpected errors
            print(f"Error loading world bible: {e}")
            return "Error: Could not load world bible."

    async def get_narrative(self, prompt: str) -> str:
        """Generate a narrative response using the world context."""
        full_prompt = f"WORLD CONTEXT:\n{self.world_bible}\n\nSTORY PROMPT:\n{prompt}"
        return await self.ollama_service.get_narrative(full_prompt)

    async def get_gm_response(self, prompt: str) -> str:
        """Generate a GM-style response without extra context."""
        return await self.ollama_service.get_gm_response(prompt)
