import random
import logging
import json
from pathlib import Path
from collections import Counter
from typing import Dict, List, Tuple

from ironaccord_bot.services.ollama_service import OllamaService
from ironaccord_bot.views.background_quiz_view import QuizSession

logger = logging.getLogger(__name__)

# Folder containing the background markdown files
BACKGROUNDS_PATH = Path("data/backgrounds/iron_accord")


def _extract_json(response: str) -> Dict:
    """Best-effort parse of JSON text returned from the LLM."""
    try:
        start = response.find("{")
        end = response.rfind("}") + 1
        if start == -1 or end == 0:
            raise ValueError("No JSON object found")
        return json.loads(response[start:end])
    except Exception as exc:  # pragma: no cover - malformed json
        logger.error("Failed to parse JSON from LLM: %s", response)
        raise


class BackgroundQuizService:
    """Generate and evaluate background quizzes."""

    def __init__(self) -> None:
        self.ollama_service = OllamaService()
        self.active_quizzes: Dict[int, QuizSession] = {}

    async def start_quiz(self, user_id: int) -> QuizSession | None:
        """Create a new quiz session for ``user_id``."""
        background_files = [p for p in BACKGROUNDS_PATH.glob("*.md") if p.name.lower() != "readme.md"]
        if len(background_files) < 3:
            return None

        chosen = random.sample(background_files, 3)
        names = [f.stem.replace("_", " ").title() for f in chosen]
        text_map = {label: path.read_text(encoding="utf-8") for label, path in zip(["A", "B", "C"], chosen)}
        name_map = {label: name for label, name in zip(["A", "B", "C"], names)}

        prompt = self._create_question_generation_prompt({name_map[l]: text_map[l] for l in ["A", "B", "C"]})
        try:
            raw = await self.ollama_service.get_gm_response(prompt)
            data = _extract_json(raw)
        except Exception as exc:  # pragma: no cover - network or parsing failure
            logger.error("Quiz generation failed: %s", exc, exc_info=True)
            return None

        session = QuizSession(
            questions=data.get("questions", []),
            background_map=name_map,
            background_text=text_map,
        )
        self.active_quizzes[user_id] = session
        return session

    def _create_question_generation_prompt(self, backgrounds: Dict[str, str]) -> str:
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

    async def record_answer_and_get_next(self, user_id: int, answer_label: str) -> Tuple[QuizSession, Dict | None]:
        session = self.active_quizzes[user_id]
        session.record_answer(answer_label)
        if not session.is_finished():
            next_q = session.get_current_question()
        else:
            next_q = None
        return session, next_q

    async def evaluate_result(self, user_id: int) -> tuple[str, str]:
        session = self.active_quizzes[user_id]
        counts = Counter(session.answers)
        most_common = counts.most_common(1)[0][0]
        background_name = session.background_map[most_common]
        background_text = session.background_text[most_common]
        prompt = (
            f"You are Edraz, a grizzled and wise warrior of the Iron Accord. Your tone is stern, but welcoming.\n"
            f"A new recruit is best suited to be a \"{background_name}\".\n\n"
            "Based on the following description of that role, write a welcome speech for the recruit. Explain their new role and why their temperament is a good fit. Keep it to two concise paragraphs.\n\n"
            f"BACKGROUND DESCRIPTION:\n{background_text}"
        )
        try:
            result = await self.ollama_service.get_narrative(prompt)
        except Exception as exc:  # pragma: no cover - network failure
            logger.error("Failed to generate final result: %s", exc, exc_info=True)
            result = "An error occurred while determining your background."
        del self.active_quizzes[user_id]
        return result, background_name
