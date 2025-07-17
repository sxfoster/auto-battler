"""Generate mission openings using player backgrounds and mission templates."""

import json
import logging
from pathlib import Path
from typing import Optional, Dict, Any, TYPE_CHECKING
from dataclasses import dataclass, field

from ironaccord_bot.utils.json_utils import extract_json_from_string

if TYPE_CHECKING:
    from ai.ai_agent import AIAgent

logger = logging.getLogger(__name__)

MISSIONS_PATH = Path("data/missions")


@dataclass
class MissionSession:
    template: str
    background: str
    history: list[str] = field(default_factory=list)


class MissionEngineService:
    """Combine mission templates with player backgrounds using an LLM."""

    def __init__(self, agent: "AIAgent") -> None:
        self.agent = agent
        self.active_sessions: Dict[int, MissionSession] = {}

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
            data = extract_json_from_string(raw)
            if not data:
                raise ValueError("No valid JSON found in the LLM response.")
            return data
        except Exception as exc:  # pragma: no cover - malformed JSON
            logger.error("Failed to parse LLM output: %s", exc, exc_info=True)
            logger.debug("Raw response from LLM was: %s", raw)
            return None

    async def start_mission(self, user_id: int, background: str, template_name: str) -> Optional[Dict[str, Any]]:
        opening = await self.generate_opening(background, template_name)
        if opening is None:
            return None
        self.active_sessions[user_id] = MissionSession(template_name, background, [opening.get("text", "")])
        return opening

    async def advance_mission(self, user_id: int, choice: str) -> Optional[Dict[str, Any]]:
        session = self.active_sessions.get(user_id)
        if not session:
            return None
        template = self.load_template(session.template)
        if template is None:
            return None
        history = "\n".join(session.history)
        prompt = (
            "You are Lore Weaver, continuing the mission.\n"
            f"PLAYER BACKGROUND:\n{session.background}\n\n"
            f"MISSION TEMPLATE:\n{json.dumps(template)}\n\n"
            f"STORY SO FAR:\n{history}\n\n"
            f"PLAYER CHOICE: {choice}\n"
            "Write the next scene followed by two numbered choices. If the mission is complete or failed, "
            "return a JSON object with 'text' and 'status' instead of 'choices'."
        )
        try:
            raw = await self.agent.get_completion(prompt)
        except Exception as exc:
            logger.error("LLM call failed: %s", exc, exc_info=True)
            return None

        try:
            data = extract_json_from_string(raw)
            if not data:
                raise ValueError("No valid JSON found in the LLM response.")
        except Exception as exc:
            logger.error("Failed to parse LLM output: %s", exc, exc_info=True)
            logger.debug("Raw response from LLM was: %s", raw)
            return None

        session.history.append(f"Player chose: {choice}\n{data.get('text', '')}")
        if data.get("status"):
            self.active_sessions.pop(user_id, None)
        return data

    async def generate_mission(self, background: str, template_name: str = "missing_person") -> Optional[Dict[str, Any]]:
        """Return a mission dictionary using ``background`` and ``template_name``."""

        return await self.generate_opening(background, template_name)
