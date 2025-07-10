import json
import logging
from typing import Any, Dict, Optional

from models import mission_service, database
from ai.ai_agent import AIAgent
from services.rag_service import RAGService

logger = logging.getLogger(__name__)


class MissionGenerator:
    """Generate missions using player context and lore."""

    def __init__(self, agent: AIAgent, rag_service: RAGService | None = None) -> None:
        self.agent = agent
        self.rag_service = rag_service

    async def _collect_player_context(self, discord_id: str) -> Dict[str, Any] | None:
        player_id = await mission_service.get_player_id(discord_id)
        if not player_id:
            return None

        res = await database.query(
            "SELECT level FROM players WHERE id = %s", [player_id]
        )
        level = res["rows"][0]["level"] if res["rows"] else 1

        stats_res = await database.query(
            "SELECT stat, value FROM user_stats WHERE player_id = %s", [player_id]
        )
        stats = {row["stat"]: row["value"] for row in stats_res["rows"]}

        codex_res = await database.query(
            "SELECT entry_key FROM codex_entries WHERE player_id = %s", [player_id]
        )
        codex = [r["entry_key"] for r in codex_res["rows"]]

        return {"level": level, "stats": stats, "codex": codex}

    def _get_lore_snippets(self) -> str:
        if not self.rag_service:
            return ""
        try:
            results = self.rag_service.query("important lore", k=3)
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

    async def generate(self, discord_id: str, objective: str = "") -> Optional[Dict[str, Any]]:
        """Generate a mission for the given player."""
        context = await self._collect_player_context(discord_id)
        if context is None:
            return None

        lore = self._get_lore_snippets()
        prompt = (
            "You are a mission design AI. Use the player info and lore below to "
            "create a short mission in JSON format.\n\n"
            f"PLAYER: {context}\n\nLORE:\n{lore}\n\nOBJECTIVE: {objective}\n"
            "Return only valid JSON describing the mission with keys 'id', "
            "'name', 'intro', 'rounds', 'rewards', and 'codexFragment'."
        )

        response = await self.agent.get_narrative(prompt)
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            logger.error("Failed to parse mission JSON: %s", response)
            return None
