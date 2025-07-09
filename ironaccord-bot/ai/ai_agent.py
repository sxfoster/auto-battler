from services.ollama_service import OllamaService


class AIAgent:
    """High-level interface for querying Ollama LLM models."""

    def __init__(self, service: OllamaService | None = None) -> None:
        self.service = service or OllamaService()

    async def get_narrative(self, prompt: str) -> str:
        """Return creative narrative text."""
        return await self.service.get_narrative(prompt)

    async def get_gm_response(self, prompt: str) -> str:
        """Return logical GM-style text."""
        return await self.service.get_gm_response(prompt)
