import logging
import json
import re
import asyncio
from typing import Dict, Tuple
from collections import Counter

from ironaccord_bot.services.ollama_service import OllamaService
from ironaccord_bot.views.background_quiz_view import QuizSession

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
        """
        Creates the prompt to generate the quiz questions.
        MODIFIED: Reinforced the instructions for the 'questions' array.
        """
        labels = list(backgrounds.keys())
        a, b, c = labels[0], labels[1], labels[2]
        return (
            f"You are a Game Master AI. Your task is to generate a 5-question multiple-choice quiz.\n\n"
            f"BACKGROUND A: \"{backgrounds[a]}\"\n"
            f"BACKGROUND B: \"{backgrounds[b]}\"\n"
            f"BACKGROUND C: \"{backgrounds[c]}\"\n\n"
            "CRITICAL INSTRUCTION: Your entire response must be ONLY a raw, valid JSON object. Do not include any text, explanations, or markdown before or after the JSON object.\n"
            "The JSON object must have two keys: 'background_map' and 'questions'.\n"
            "- 'background_map': maps labels 'A', 'B', 'C' to the background names.\n"
            "- 'questions': a list of JSON objects. Ensure the list contains only comma-separated objects `[ {obj1}, {obj2}, ... ]` with no other text or numbers between them."
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
                json_string = extract_json_from_string(raw_response)

                if not json_string:
                    logger.warning(f"Attempt {attempt + 1}: Could not extract JSON from LLM response.")
                    await asyncio.sleep(1)
                    continue

                quiz_data = json.loads(json_string)

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
