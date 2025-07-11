"""Generate narrative scenes using world lore and player choices."""

import logging
from typing import Optional

from ai.ai_agent import AIAgent
from services.rag_service import RAGService

logger = logging.getLogger(__name__)


class MissionGenerator:
    """Generate story scenes using the player's chosen background and lore."""

    def __init__(self, agent: AIAgent, rag_service: RAGService | None = None) -> None:
        self.agent = agent
        self.rag_service = rag_service


    def _get_lore_snippets(self, query: str) -> str:
        """Return lore snippets related to *query* from the RAG service."""
        if not self.rag_service:
            return ""
        logger.info("Calling RAG service for '%s'", query)
        try:
            results = self.rag_service.query(query, k=3)
            snippets = []
            for doc in results:
                if hasattr(doc, "page_content"):
                    snippets.append(doc.page_content)
                else:
                    snippets.append(str(doc))
            return "\n".join(snippets)
        except Exception as exc:  # pragma: no cover - RAG may fail
            logger.error("Failed during RAG service call: %s", exc, exc_info=True)
            return ""

    async def generate_intro(self, background: str) -> Optional[str]:
        """Generate the opening scene for the chosen ``background``."""

        logger.info("Gathering lore snippets for world overview")
        world_lore = self._get_lore_snippets("world overview")

        logger.info("Gathering lore snippets for Iron Accord faction")
        faction_lore = self._get_lore_snippets("iron accord faction")

        prompt = (
            "System: You are a master TTRPG Dungeon Master. Your task is to start a "
            "short, self-contained steampunk adventure for the player based on their "
            "chosen background. The story must have an introduction and an immediate "
            "situation that requires the player to make a decision.\n\n"
            f"WORLD LORE:\n{world_lore}\n{faction_lore}\n\n"
            f"PLAYER CONTEXT:\nPlayer Background: {background}\n\n"
            "TASK:\nCraft the opening scene of an adventure. Describe the player's "
            "immediate surroundings and present them with a challenge or a mystery. "
            "End your response by explicitly asking the player: 'What do you do?'"
        )

        logger.info("Calling language model for story generation")
        try:
            text = await self.agent.get_narrative(prompt)
        except Exception as exc:
            logger.error("Failed during LLM call: %s", exc, exc_info=True)
            return None

        return text
