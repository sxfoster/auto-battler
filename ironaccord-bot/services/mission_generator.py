import json
import logging
from typing import Any, Dict, Optional

from ai.ai_agent import AIAgent
from services.rag_service import RAGService
from services.player_context_service import gather_player_context

logger = logging.getLogger(__name__)


class MissionGenerator:
    """Generate missions using player context and lore."""

    def __init__(self, agent: AIAgent, rag_service: RAGService | None = None) -> None:
        self.agent = agent
        self.rag_service = rag_service


    def _get_lore_snippets(self, query: str) -> str:
        """Return lore snippets related to *query* from the RAG service."""
        if not self.rag_service:
            return ""
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
            logger.warning("RAG query failed: %s", exc)
            return ""

    async def generate(
        self,
        discord_id: str,
        request_type: str,
        request_details: str,
    ) -> Optional[Dict[str, Any]]:
        """Generate a mission for the given player."""
        context = await gather_player_context(discord_id)
        if context is None:
            return None

        lore = self._get_lore_snippets(request_details)
        prompt = (
            "You are a mission design AI. Use the player info and lore below to "
            "create a short mission in JSON format.\n\n"
            f"PLAYER: {context}\n\nLORE:\n{lore}\n\nMISSION TYPE: {request_type}\n"
            f"REQUEST DETAILS: {request_details}\n"
            "Return only valid JSON describing the mission with keys 'id', "
            "'name', 'intro', 'rounds', 'rewards', and 'codexFragment'."
        )

        response = await self.agent.get_narrative(prompt)
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            logger.error("Failed to parse mission JSON: %s", response)
            return None
