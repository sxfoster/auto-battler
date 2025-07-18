import logging
import json
import re
import asyncio
from typing import Dict, Tuple
from collections import Counter

from ironaccord_bot.services.ollama_service import OllamaService
from ironaccord_bot.views.background_quiz_view import QuizSession
from ironaccord_bot.utils.json_utils import extract_json_from_string

logger = logging.getLogger(__name__)


def _extract_json(response: str) -> Dict:
    """Best-effort parse of JSON text returned from the LLM."""
    if not response:
        raise ValueError("LLM returned an empty response.")

    # Regex to find a JSON object within optional markdown code blocks
    match = re.search(r'```json\s*(\{.*\})\s*```|(\{.*\})', response, re.DOTALL)
    if match:
        json_string = match.group(1) or match.group(2)
        try:
            return json.loads(json_string)
        except json.JSONDecodeError as e:
            logger.error("Failed to parse the extracted JSON string: %s", json_string)
            raise ValueError(f"Extracted text is not valid JSON: {e}") from e

    logger.error("No JSON object could be found in the LLM response: %s", response)
    raise ValueError("No JSON object found in the response string.")


class BackgroundQuizService:
    """Manages the logic and state for the character background quiz."""

    def __init__(self, ollama_service: OllamaService):
        self.ollama_service = ollama_service
        self.active_quizzes: Dict[int, QuizSession] = {}

    def _create_question_generation_prompt(self, backgrounds: dict, template: str) -> str:
        """Creates a strict prompt for the LLM to generate quiz questions."""

        background_lines = []
        for key, value in backgrounds.items():
            if isinstance(value, dict) and "name" in value:
                name = value.get("name", key)
            else:
                name = key
            background_lines.append(f"- {key}: {name}")
        background_list = "\n".join(background_lines)

        json_schema = """
        {
          "title": "A title for the quiz, like 'Your Iron Accord Chronicle Begins'",
          "questions": [
            {
              "question_text": "A compelling, scenario-based question.",
              "choices": [
                {"text": "A choice that reflects one or more backgrounds.", "maps_to": "BACKGROUND_KEY"},
                {"text": "Another choice.", "maps_to": "BACKGROUND_KEY"},
                {"text": "A third choice.", "maps_to": "BACKGROUND_KEY"}
              ]
            }
          ]
        }
        """

        rules = """
        1.  You MUST output a single, valid JSON object and nothing else.
        2.  All keys and string values in the JSON MUST be enclosed in double quotes ("').
        3.  Each question MUST have exactly 3 choices.
        4.  The `maps_to` value for each choice MUST be one of the provided background keys.
        5.  Do NOT include trailing commas after the last element in an array or object.
        6.  The quiz should consist of 3-5 questions.
        """

        prompt = f"""
        You are a game master's assistant responsible for creating a personality quiz.
        Your task is to generate a quiz that determines a player's starting archetype in the steampunk fantasy world of Iron Accord.

        **BACKGROUND ARCHETYPES:**
        {background_list}

        **INSTRUCTIONS:**
        Generate a quiz based on the provided mission template. Adhere strictly to the following rules and JSON schema.

        **MISSION TEMPLATE:**
        "{template}"

        **RULES:**
        {rules}

        **JSON SCHEMA AND EXAMPLE:**
        Your output MUST conform to this exact JSON structure.
        ```json
        {json_schema}
        ```

        Now, generate the quiz as a single JSON object.
        """
        return prompt.strip()

    async def start_quiz(
        self, user_id: int, backgrounds: Dict[str, str], template: str = "salvage_run"
    ) -> QuizSession | None:
        """
        Generates and starts a new quiz for a user.
        MODIFIED: Implements a retry loop to handle malformed JSON from the LLM.
        """
        prompt = self._create_question_generation_prompt(backgrounds, template)
        max_attempts = 3

        for attempt in range(max_attempts):
            logger.info(f"Attempting to generate quiz (Attempt {attempt + 1}/{max_attempts})")
            try:
                raw_response = await self.ollama_service.get_gm_response(prompt)
                quiz_data = extract_json_from_string(raw_response)

                if not quiz_data:
                    logger.warning(
                        f"Attempt {attempt + 1}: Could not extract JSON from LLM response."
                    )
                    await asyncio.sleep(1)
                    continue

                background_text_map = {
                    "A": backgrounds.get(quiz_data["background_map"]["A"], ""),
                    "B": backgrounds.get(quiz_data["background_map"]["B"], ""),
                    "C": backgrounds.get(quiz_data["background_map"]["C"], ""),
                }

                session = QuizSession(
                    questions=quiz_data["questions"],
                    background_map=quiz_data["background_map"],
                    background_text=background_text_map,
                )
                self.active_quizzes[user_id] = session
                logger.info(f"Successfully generated quiz on attempt {attempt + 1}.")
                return session

            except (json.JSONDecodeError, KeyError, ValueError) as e:
                logger.error(f"Attempt {attempt + 1} failed to parse quiz data: {e}", exc_info=True)
                if attempt < max_attempts - 1:
                    await asyncio.sleep(1)
                else:
                    logger.error("All attempts to generate a valid quiz have failed.")
                    return None

        return None

    async def record_answer_and_get_next(self, user_id: int, answer_label: str) -> Tuple[QuizSession, Dict | None]:
        """Record a user's answer and return the next question."""
        session = self.active_quizzes[user_id]
        session.record_answer(answer_label)
        next_question = session.get_current_question()
        return session, next_question

    def evaluate_result(self, user_id: int) -> Tuple[str, str, QuizSession | None]:
        """Return the chosen archetype key, its name, and the quiz session."""
        session = self.active_quizzes.get(user_id)
        if not session:
            return "Unknown", "Unknown", None

        counts = Counter(session.answers)
        if not counts:
            most_common_label = list(session.background_map.keys())[0]
        else:
            most_common_label = counts.most_common(1)[0][0]

        archetype_name = session.background_map.get(most_common_label, "Unknown")
        return most_common_label, archetype_name, session

    def cleanup_quiz_session(self, user_id: int):
        """Remove a quiz session after it is fully processed."""
        if user_id in self.active_quizzes:
            del self.active_quizzes[user_id]
            logger.info(f"Cleaned up quiz session for user {user_id}.")
