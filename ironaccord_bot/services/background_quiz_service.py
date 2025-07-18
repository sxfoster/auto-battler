import logging
import json
import re
import asyncio
from typing import Dict, Tuple
from collections import Counter

from ironaccord_bot.services.ollama_service import OllamaService
from ironaccord_bot.views.background_quiz_view import QuizSession
from ironaccord_bot.utils.json_utils import extract_and_parse_json

logger = logging.getLogger(__name__)
MAX_RETRIES = 3


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

    def _create_question_generation_prompt(self, backgrounds: Dict[str, str]) -> str:
        """Create a detailed prompt for generating situational quiz questions."""

        labels = list(backgrounds.keys())
        a, b, c = labels[0], labels[1], labels[2]

        return (
            "You are a master TTRPG storyteller creating a personality quiz. "
            "Your goal is to determine which of three character archetypes a new player aligns with based on their answers to situational questions.\n\n"
            "## Archetypes:\n"
            f"- **ARCHETYPE A ({a}):** {backgrounds[a]}\n"
            f"- **ARCHETYPE B ({b}):** {backgrounds[b]}\n"
            f"- **ARCHETYPE C ({c}):** {backgrounds[c]}\n\n"
            "## Your Task:\n"
            "Generate a 5-question multiple-choice quiz. Follow these rules precisely:\n"
            "1.  **Create Situational Questions:** The questions must be abstract scenarios about difficult choices, not questions about the archetypes themselves.\n"
            "2.  **Do Not Name the Archetypes:** Absolutely do not use the archetype names (like 'Salvage Scout' or 'Marshal') in the questions or answers.\n"
            "3.  **Align Answers to Archetypes:** Each answer option ('A', 'B', 'C') for a question should reflect a choice that one of the corresponding archetypes would make.\n"
            "4.  **Strict JSON Output:** Respond ONLY with a raw, valid JSON object. Do not include any text or markdown formatting before or after the JSON.\n"
            "    Your response MUST be valid JSON and nothing else.\n\n"
            "## JSON Structure:\n"
            "The JSON object must contain exactly two keys: 'background_map' and 'questions'.\n"
            "- `background_map`: A dictionary mapping 'A', 'B', and 'C' to the original archetype names.\n"
            "- `questions`: A JSON array of exactly 5 question objects. Each object must have:\n"
            "  - A `question` key with a string value.\n"
            "  - An `answers` key with an array of exactly three string values, each corresponding to choices A, B, and C.\n\n"
            "### Example Question Object:\n"
            '{\n'
            '    "question": "A caravan is being attacked by raiders. What is your first instinct?",\n'
            '    "answers": [\n'
            '        "A. Intervene directly, using force to protect the innocent.",\n'
            '        "B. Observe from a distance to gather information before acting.",\n'
            '        "C. Create a diversion to help the caravan escape without a direct fight."\n'
            '    ]\n'
            '}'
        )

    async def start_quiz(self, user_id: int, backgrounds: Dict[str, str]) -> QuizSession | None:
        """
        Generates and starts a new quiz for a user.
        MODIFIED: Implements a retry loop to handle malformed JSON from the LLM.
        """
        prompt = self._create_question_generation_prompt(backgrounds)

        for attempt in range(1, MAX_RETRIES + 1):
            logger.info(
                f"Attempt {attempt}: Generating quiz for user {user_id}."
            )
            try:
                raw_response = await self.ollama_service.get_gm_response(prompt)
                logger.debug("Raw LLM response: %s", raw_response)
                quiz_data = extract_and_parse_json(raw_response)

                if not quiz_data:
                    logger.warning(
                        f"Attempt {attempt}: Could not extract JSON from LLM response."
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
                logger.info(
                    f"Successfully generated quiz on attempt {attempt}."
                )
                return session

            except (json.JSONDecodeError, KeyError, ValueError) as e:
                logger.error(
                    f"Attempt {attempt} failed to parse quiz data: {e}",
                    exc_info=True,
                )
                if attempt < MAX_RETRIES:
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
