"""Generate mission openings using player backgrounds and mission templates."""

import json
import logging
from pathlib import Path
from typing import Optional, Dict, Any, TYPE_CHECKING

if TYPE_CHECKING:
    from ai.ai_agent import AIAgent

logger = logging.getLogger(__name__)

MISSIONS_PATH = Path("data/missions")


def _extract_json(text: str) -> Dict[str, Any]:
    """Best-effort parse of JSON text returned from the LLM."""
    start = text.find("{")
    end = text.rfind("}") + 1
    if start == -1 or end == 0:
        raise ValueError("No JSON object found")
    return json.loads(text[start:end])


class MissionEngineService:
    """Combine mission templates with player backgrounds using an LLM."""

    def __init__(self, agent: "AIAgent") -> None:
        self.agent = agent

    def load_template(self, name: str) -> Optional[Dict[str, Any]]:
        """Load the mission template with the given ``name``."""
        file = MISSIONS_PATH / f"{name}.json"
        if not file.exists():
            return None
        try:
            return json.loads(file.read_text(encoding="utf-8"))
        except Exception as exc:  # pragma: no cover - unexpected I/O errors
            logger.error("Failed to load template %s: %s", name, exc, exc_info=True)
            return None

    async def generate_opening(self, background: str, template_name: str) -> Optional[Dict[str, Any]]:
        """Return a mission opening using ``background`` and ``template_name``."""
        template = self.load_template(template_name)
        if template is None:
            return None

        prompt = (
            "You are Lore Weaver, a master TTRPG storyteller. "
            "Using the player's background and the mission template, "
            "craft a short opening scene followed by two or three numbered choices.\n\n"
            f"PLAYER BACKGROUND:\n{background}\n\n"
            f"MISSION TEMPLATE:\n{json.dumps(template)}\n\n"
            "Respond ONLY with a JSON object containing 'text' and 'choices'."
        )
        try:
            raw = await self.agent.get_completion(prompt)
        except Exception as exc:
            logger.error("LLM call failed: %s", exc, exc_info=True)
            return None

        try:
            return _extract_json(raw)
        except Exception as exc:  # pragma: no cover - malformed JSON
            logger.error("Failed to parse LLM output: %s", exc, exc_info=True)
            return None
