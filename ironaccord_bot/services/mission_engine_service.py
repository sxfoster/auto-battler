"""Generate mission openings using player backgrounds and mission templates."""

import json
import logging
from pathlib import Path
from typing import Optional, Dict, Any, TYPE_CHECKING
from dataclasses import dataclass, field

from ironaccord_bot.utils import json_utils
from . import ollama_service

if TYPE_CHECKING:
    from ai.ai_agent import AIAgent

logger = logging.getLogger(__name__)

MISSIONS_PATH = Path("data/missions")


def get_unified_mission_prompt(character, mission, user_choice_text: str) -> str:
    """Return a single prompt for the unified mission generation flow."""
    return f"""
    You are a master storyteller and game designer generating the next step of a quest.

    **Character:** A {character.class_name} named {character.name}
    **Current Situation:** {mission.state}
    **Player's Action:** "{user_choice_text}"

    Generate a creative and engaging outcome for this action. Then, provide three new, distinct choices for the player.
    Your response MUST be ONLY a single, valid JSON object. Do not add any conversational text, explanations, or markdown.

    **JSON Schema:**
    {{
      "outcome_text": "A narrative paragraph describing the result of the player's action.",
      "choices": [
        {{ "id": 1, "text": "A compelling first choice for the player." }},
        {{ "id": 2, "text": "A compelling second choice for the player." }},
        {{ "id": 3, "text": "A compelling third choice for the player." }}
      ]
    }}
    """


@dataclass
class MissionSession:
    template: str
    background: str
    history: list[str] = field(default_factory=list)


def get_phi3_formatter_prompt(mixtral_output: str) -> str:
    """Return a prompt instructing phi3 to format ``mixtral_output`` as JSON."""

    return f"""
    You are a data formatting expert. Convert the following text into a valid JSON object.
    The text contains a narrative outcome and three numbered choices.

    Text to format:
    ---
    {mixtral_output}
    ---

    Your response MUST be a valid JSON object and nothing else. Do not include any other text or markdown formatting.
    Use this exact structure:
    {{
      "outcome_text": "The narrative paragraph.",
      "choices": [
        {{ "id": 1, "text": "The first choice." }},
        {{ "id": 2, "text": "The second choice." }},
        {{ "id": 3, "text": "The third choice." }}
      ],
      "status_effect": null
    }}
    """


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

        mixtral_prompt = (
            "You are Lore Weaver, a master TTRPG storyteller. "
            "Using the player's background and the mission template, "
            "craft a short opening scene followed by two or three numbered choices.\n\n"
            f"PLAYER BACKGROUND:\n{background}\n\n"
            f"MISSION TEMPLATE:\n{json.dumps(template)}\n\n"
            "Respond ONLY with narrative text followed by numbered choices."
        )

        try:
            narrative = await self.agent.get_narrative(mixtral_prompt)
        except Exception as exc:
            logger.error("LLM call failed: %s", exc, exc_info=True)
            return None

        phi3_prompt = get_phi3_formatter_prompt(narrative)

        try:
            raw_json = await self.agent.get_gm_response(phi3_prompt)
        except Exception as exc:  # pragma: no cover - unexpected
            logger.error("LLM call failed: %s", exc, exc_info=True)
            return None

        try:
            data = json_utils.extract_and_parse_json(raw_json)
            if not data:
                raise ValueError("No valid JSON found in the LLM response.")
        except Exception as exc:  # pragma: no cover - malformed JSON
            logger.error("Failed to parse LLM output: %s", exc, exc_info=True)
            logger.debug("Raw response from LLM was: %s", raw_json)
            return None

        if "outcome_text" in data and "text" not in data:
            data["text"] = data.pop("outcome_text")

        return data

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
        mixtral_prompt = (
            "You are Lore Weaver, continuing the mission.\n"
            f"PLAYER BACKGROUND:\n{session.background}\n\n"
            f"MISSION TEMPLATE:\n{json.dumps(template)}\n\n"
            f"STORY SO FAR:\n{history}\n\n"
            f"PLAYER CHOICE: {choice}\n"
            "Write the next scene in a short paragraph, then list two or three numbered choices."
        )

        try:
            narrative = await self.agent.get_narrative(mixtral_prompt)
        except Exception as exc:
            logger.error("LLM call failed: %s", exc, exc_info=True)
            return None

        phi3_prompt = get_phi3_formatter_prompt(narrative)
        try:
            raw_json = await self.agent.get_gm_response(phi3_prompt)
        except Exception as exc:
            logger.error("LLM call failed: %s", exc, exc_info=True)
            return None

        try:
            data = json_utils.extract_and_parse_json(raw_json)
            if not data:
                raise ValueError("No valid JSON found in the LLM response.")
        except Exception as exc:
            logger.error("Failed to parse LLM output: %s", exc, exc_info=True)
            logger.debug("Raw response from LLM was: %s", raw_json)
            return None

        if "outcome_text" in data and "text" not in data:
            data["text"] = data.pop("outcome_text")

        session.history.append(f"Player chose: {choice}\n{data.get('text', '')}")
        if data.get("status") or data.get("status_effect"):
            self.active_sessions.pop(user_id, None)
        return data

    async def generate_mission(self, background: str, template_name: str = "missing_person") -> Optional[Dict[str, Any]]:
        """Return a mission dictionary using ``background`` and ``template_name``."""

        return await self.generate_opening(background, template_name)


async def advance_mission_interaction(interaction, user_choice_text: str):
    """Advance a mission using a single streaming call to the unified LLM."""
    await interaction.response.send_message("Edraz is considering your choice...", ephemeral=True)

    # Assuming ``character`` and ``mission`` are retrieved elsewhere in the bot
    character = interaction.client.character_service.get_character(interaction.user.id)
    mission = interaction.client.mission_service.get_active_mission(interaction.user.id)

    prompt = get_unified_mission_prompt(character, mission, user_choice_text)

    full_text = ""
    async for chunk in ollama_service.stream_request(prompt, ["llama3:70b-instruct"]):
        full_text += chunk

    if not full_text:
        await interaction.edit_original_response(content="My thoughts are clouded. Please try again.")
        return

    mission_data = json_utils.extract_and_parse_json(full_text)
    if not mission_data:
        await interaction.edit_original_response(content="A critical error occurred in my thought process. Please try again.")
        logger.error("CRITICAL: Primary model failed to produce valid JSON. Response: %s", full_text)
        return

    outcome = mission_data.get("outcome_text", "An unexpected event occurs.")
    choices = mission_data.get("choices", [])
    choice_list = [f"**{chr(65 + i)}.** {choice['text']}" for i, choice in enumerate(choices)]
    formatted_choices = "\n".join(choice_list)
    message_content = f"**Scene:** {mission.scene_title}\n\n{outcome}\n\n{formatted_choices}"

    from discord import Button, ButtonStyle, ActionRow

    buttons = [
        Button(style=ButtonStyle.secondary, label=f"{chr(65 + i)}", custom_id=f"mission_choice:{choice['id']}")
        for i, choice in enumerate(choices)
    ]
    action_row = ActionRow(*buttons)

    await interaction.edit_original_response(content=message_content, components=[action_row])
    logger.info("Successfully advanced mission for user %s", interaction.user.id)
