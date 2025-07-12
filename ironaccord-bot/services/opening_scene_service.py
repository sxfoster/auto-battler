import json
import re
import logging
from typing import Optional, TYPE_CHECKING

from services.rag_service import RAGService

if TYPE_CHECKING:
    from ai.ai_agent import AIAgent

logger = logging.getLogger(__name__)


class OpeningSceneService:
    """Generate an introductory scene using RAG context and the Lore Weaver LLM."""

    def __init__(self, agent: "AIAgent", rag_service: RAGService | None = None) -> None:
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

    async def generate_opening(self, text: str) -> dict | None:
        """
        Generates the opening scene using the AI agent and RAG service.
        This method is now robust against malformed JSON from the LLM.
        """
        logging.info("Fetching location and NPC data from RAG service")
        location = self.rag_service.get_entity_by_name("Brasshaven") if self.rag_service else {}
        npc = self.rag_service.get_entity_by_name("Edraz") if self.rag_service else {}

        prompt = self.agent.get_structured_scene_prompt(location, npc)

        raw_response = await self.agent.get_completion(prompt)

        if not raw_response:
            logging.error("Received no response from the AI agent.")
            return None

        try:
            json_match = re.search(r'\{.*\}', raw_response, re.DOTALL)

            if not json_match:
                logging.error(f"No JSON object found in the LLM response: {raw_response}")
                return None

            json_string = json_match.group(0)

            return json.loads(json_string)

        except json.JSONDecodeError as e:
            logging.error(f"Lore Weaver returned invalid JSON: {raw_response}")
            logging.error(f"JSON parsing failed with error: {e}")
            return None
