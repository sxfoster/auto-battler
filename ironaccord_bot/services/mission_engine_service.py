import logging
from typing import Optional

from ai.ai_agent import AIAgent
from .mission_generator import MissionGenerator
from .rag_service import RAGService

logger = logging.getLogger(__name__)


class MissionEngineService:
    """Simple service for generating test missions."""

    def __init__(self, agent: AIAgent | None = None, rag_service: RAGService | None = None) -> None:
        self.agent = agent or AIAgent()
        self.generator = MissionGenerator(self.agent, rag_service)

    async def generate_mission(self, background: str) -> Optional[dict]:
        """Generate a basic mission definition using ``background``."""
        intro = await self.generator.generate_intro(background)
        if not intro:
            return None
        return {
            "id": 0,
            "name": f"Generated-{background}",
            "intro": intro,
            "rounds": [],
        }
