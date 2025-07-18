from __future__ import annotations

import json

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .mission_engine_service import MissionSession


def build_action_mechanics_prompt(choice: str, session: MissionSession) -> str:
    """Return the prompt for resolving action mechanics."""
    history = "\n".join(session.history)
    return (
        "You are a fast, logical game master. "
        f"The player chose to '{choice}'. Based on the context below, "
        "determine the immediate mechanical outcome. Respond in JSON with "
        'keys "success", "outcome_summary", and "new_choices" (a list of 3 strings).'
        " You may also include optional 'status' or 'status_effect' keys.\n\n"
        f"BACKGROUND:\n{session.background}\n\nSTORY SO FAR:\n{history}"
    )


def build_narrative_prompt(outcome_summary: str, session: MissionSession) -> str:
    """Return the prompt for generating rich narrative text."""
    history = "\n".join(session.history)
    return (
        "You are a master storyteller. "
        f"A player's action resulted in: '{outcome_summary}'. "
        "Describe this scene in rich, evocative detail (2-3 sentences).\n\n"
        f"BACKGROUND:\n{session.background}\n\nSTORY SO FAR:\n{history}"
    )


def build_opening_prompt(background: str, template: dict[str, any]) -> str:
    """Return the prompt for the initial mission opening."""
    return (
        "You are Lore Weaver, a master TTRPG storyteller. "
        "Using the player's background and the mission template, "
        "craft a short opening scene followed by two or three numbered choices.\n\n"
        f"PLAYER BACKGROUND:\n{background}\n\n"
        f"MISSION TEMPLATE:\n{json.dumps(template)}\n\n"
        "Respond ONLY with narrative text followed by numbered choices."
    )


def build_phi3_formatter_prompt(mixtral_output: str) -> str:
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

def build_unified_mission_prompt(character, mission, user_choice_text: str) -> str:
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
