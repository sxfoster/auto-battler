import logging
import json
from typing import Dict, List, Tuple
from collections import Counter

from ironaccord_bot.services.ollama_service import OllamaService
from ironaccord_bot.views.background_quiz_view import QuizSession

logger = logging.getLogger(__name__)


class BackgroundQuizService:
    """Manages the logic and state for the character background quiz."""

    def __init__(self, ollama_service: OllamaService):
        self.ollama_service = ollama_service
        self.active_quizzes: Dict[int, QuizSession] = {}

    def _create_question_generation_prompt(self, backgrounds: Dict[str, str]) -> str:
        """
        Creates the prompt to generate the quiz questions.
        MODIFIED: Now asks for a variable number of answers (2 to 4).
        """
        labels = list(backgrounds.keys())
        a, b, c = labels[0], labels[1], labels[2]
        return (
            f"You are a Game Master AI for a grim, industrial world called Iron Accord.\n"
            "Your task is to generate a 5-question multiple-choice quiz to help a player find their character's background.\n\n"
            f"BACKGROUND {a}: \"{a}\"\n{backgrounds[a]}\n\n"
            f"BACKGROUND {b}: \"{b}\"\n{backgrounds[b]}\n\n"
            f"BACKGROUND {c}: \"{c}\"\n{backgrounds[c]}\n\n"
            "Generate 5 scenario-based questions. Each question must have between 2 and 4 answers, where each answer reflects the mindset of one of the backgrounds (A, B, or C).\n"
            "Return ONLY a JSON object with two keys: 'background_map' and 'questions'.\n"
            "- 'background_map': maps labels 'A', 'B', 'C' to the background names.\n"
            "- 'questions': a list of objects, each with a 'question' string and a list of 'answers' strings. Each answer string must start with 'A)', 'B)', or 'C)' to map back to a background."
        )

    async def start_quiz(self, user_id: int, backgrounds: Dict[str, str]) -> QuizSession | None:
        """Generates and starts a new quiz for a user."""
        prompt = self._create_question_generation_prompt(backgrounds)
        try:
            response = await self.ollama_service.get_gm_response(prompt)
            quiz_data = json.loads(response)
            
            # Create background text map
            background_text_map = {
                "A": backgrounds.get(quiz_data["background_map"]["A"], ""),
                "B": backgrounds.get(quiz_data["background_map"]["B"], ""),
                "C": backgrounds.get(quiz_data["background_map"]["C"], ""),
            }

            session = QuizSession(
                questions=quiz_data["questions"],
                background_map=quiz_data["background_map"],
                background_text=background_text_map
            )
            self.active_quizzes[user_id] = session
            return session
        except (json.JSONDecodeError, KeyError) as e:
            logger.error("Failed to parse quiz data from LLM: %s\nResponse: %s", e, response, exc_info=True)
            return None
        except Exception as e:
            logger.error("An unexpected error occurred during quiz start: %s", e, exc_info=True)
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
