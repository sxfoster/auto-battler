import logging
import json
from pathlib import Path
from typing import Dict, Optional # Make sure Optional is imported for clarity if used
import random # Add this import
from ironaccord_bot.services.ollama_service import OllamaService
from ironaccord_bot.services.rag_service import RAGService
from ironaccord_bot.services.prompt_factory import PromptFactory
from ironaccord_bot import config # Import config to access model names

logger = logging.getLogger(__name__)

# ironaccord_bot/services/mission_generator.py
# ... (rest of the file content)
class MissionGenerator:
    def __init__(self, ollama_service: OllamaService, rag_service: RAGService, prompt_factory: PromptFactory):
        self.ollama_service = ollama_service
        self.rag_service = rag_service
        self.prompt_factory = prompt_factory
        self.data_path = Path(__file__).parent.parent / "data" / "missions"

    async def generate_initial_mission(self, player_id: int, archetype: str, template_name: str) -> Dict | None:
        logger.info(f"Generating initial mission for player {player_id} with archetype {archetype} using template {template_name}.")

        try:
            # 1. Load the mission template
            template_path = self.data_path / f"{template_name}.json"
            if not template_path.exists():
                logger.error(f"Mission template not found: {template_path}")
                return None

            with open(template_path, 'r', encoding='utf-8') as f:
                mission_template = json.load(f)

            # 2. Select random values for template placeholders (or use DM LLM if more complex logic is needed)
            # For a quick demo, simple random choices are fast and effective.
            selected_location = random.choice(mission_template.get("location_options", ["an old ruin"]))
            selected_threat = random.choice(mission_template.get("threat_options", ["unforeseen dangers"]))
            selected_component = random.choice(mission_template.get("component_options", ["valuable artifact"]))

            # 3. Construct a specific prompt for the Lore Weaver (Narrator) LLM
            # The Lore Weaver's task is now to fill the narrative template, not create a story.
            lore_weaver_prompt = f"""
            You are the Lore Weaver for the Iron Accord game.
            Your task is to take a given mission's opening narrative template and fill in its placeholders,
            generating a concise and immersive opening description for the player.
            Do NOT add any choices, questions, or game mechanics. Only provide the descriptive text.

            Mission Title: {mission_template['title']}
            Briefing: {mission_template['briefing']}

            Here is the template for the opening narrative:
            "{mission_template['opening_narrative_template']}"

            Fill this template using the following details:
            - Location: {selected_location}
            - Component Type: {selected_component}
            - Threat Type: {selected_threat}

            Your response MUST be ONLY the generated narrative text, nothing else.
            """

            # 4. Send request to the Lore Weaver (Narrator) LLM
            # Use the config.OLLAMA_NARRATOR_MODEL for this, as it's typically the larger, more creative model.
            logger.info(f"Sending prompt to Narrator LLM for mission opening for user {player_id}.")
            raw_narrative_response = await self.ollama_service.send_request(
                lore_weaver_prompt, [config.OLLAMA_NARRATOR_MODEL]
            )

            if not raw_narrative_response:
                logger.error(f"Narrator LLM returned empty response for mission opening for user {player_id}.")
                return None

            generated_opening_text = raw_narrative_response.strip()

            # 5. Prepare the mission data to return
            # We use the template's structure but update the opening narrative.
            return {
                "mission_id": mission_template["mission_id"],
                "title": mission_template["title"],
                "text": generated_opening_text,
                "choices": mission_template["initial_choices"],
                # Store the selected details if they are needed for later mission stages
                "context": {
                    "location": selected_location,
                    "threat": selected_threat,
                    "component": selected_component
                }
            }

        except Exception as e:
            logger.error(f"Error generating initial mission for user {player_id}: {e}", exc_info=True)
            return None
# ... (rest of the file content)
