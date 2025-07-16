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
            "4.  **Strict JSON Output:** Respond ONLY with a raw, valid JSON object. Do not include any text or markdown formatting before or after the JSON.\n\n"
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
        """Records a user's answer and returns the next question."""
        session = self.active_quizzes[user_id]
        session.record_answer(answer_label)
        next_question = session.get_current_question()
        return session, next_question

    async def evaluate_result(self, user_id: int) -> Tuple[str, str]:
        """
        Evaluates the quiz results and generates a welcome message.
        MODIFIED: Prompt is improved for tone and brevity.
        """
        session = self.active_quizzes.get(user_id)
        if not session:
            return "Error: Could not find your quiz session.", "Unknown"

        counts = Counter(session.answers)
        most_common_label = counts.most_common(1)[0][0]
        background_name = session.background_map[most_common_label]
        background_text = session.background_text[most_common_label]

        prompt = (
            f"You are Edraz, a grizzled and wise warrior of the Iron Accord. Your tone is stern, but welcoming.\n"
            f"A new recruit is best suited to be a \"{background_name}\".\n\n"
            "Based on the following description of that role, write a welcome speech for the recruit. Explain their new role and why their temperament is a good fit. Keep it to two concise paragraphs.\n\n"
            f"BACKGROUND DESCRIPTION:\n{background_text}"
        )
        try:
            result = await self.ollama_service.get_narrative(prompt)
        except Exception as exc:
            logger.error("Failed to generate final result: %s", exc, exc_info=True)
            result = "An error occurred while determining your background."

        del self.active_quizzes[user_id]
        return result, background_name

    def create_welcome_message(self, session: "QuizSession", background_name: str) -> str:
        """Return a short welcome message for the completed quiz."""

        description = session.background_text.get(background_name, "")
        return (
            f"**Welcome, {background_name}!**\n\n"
            f"*{description}*\n\n"
            "You are now ready to begin your first mission. Use the `/mission` command to see what's available."
        )
