import json
import logging
from typing import Optional

from ai.ai_agent import AIAgent
from services.rag_service import RAGService

logger = logging.getLogger(__name__)


class OpeningSceneService:
    """Generate an introductory scene using RAG context and the Lore Weaver LLM."""

    def __init__(self, agent: AIAgent, rag_service: RAGService | None = None) -> None:
        self.agent = agent
        self.rag_service = rag_service

    def _gather_context(self, description: str) -> str:
        """Return lore snippets related to the player's description."""
        if not self.rag_service:
            return ""
        try:
            results = self.rag_service.query(description, k=3)
        except Exception as exc:  # pragma: no cover - rag failure
            logger.error("RAG query failed: %s", exc, exc_info=True)
            return ""
        snippets: list[str] = []
        for doc in results:
            if hasattr(doc, "page_content"):
                snippets.append(doc.page_content)
            else:
                snippets.append(str(doc))
        return "\n".join(snippets)

    async def generate_opening(self, description: str) -> Optional[dict]:
        """Create an opening scene for *description*.

        Returns the parsed JSON result or ``None`` on failure.
        """
        context = self._gather_context(description)
        prompt = (
            "You are the Lore Weaver, a master storyteller. A new hero has entered the world. "
            f"Their description is: {description}\n"
            f"Relevant lore:\n{context}\n\n"
            "Using this information, craft a thrilling opening scene. "
            "Place them in immediate peril or before a critical decision. "
            "Conclude your response with a question and provide three distinct choices as a list. "
            "Return the result as JSON with the keys 'scene', 'question', and 'choices'."
        )
        try:
            text = await self.agent.get_narrative(prompt)
        except Exception as exc:  # pragma: no cover - unexpected model failure
            logger.error("Lore Weaver call failed: %s", exc, exc_info=True)
            return None
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            logger.error("Lore Weaver returned invalid JSON: %s", text)
            return None
