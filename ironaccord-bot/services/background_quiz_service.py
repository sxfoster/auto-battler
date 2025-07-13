import json
import logging
from pathlib import Path
from typing import List, Dict, Any

from ai.ai_agent import AIAgent


def extract_json_from_llm(response_text: str) -> dict:
    """Find and parse a JSON object embedded in ``response_text``."""
    start_index = response_text.find("{")
    end_index = response_text.rfind("}") + 1
    if start_index == -1 or end_index == 0:
        raise ValueError("No JSON object found in the LLM response.")
    json_str = response_text[start_index:end_index]
    return json.loads(json_str)

logger = logging.getLogger(__name__)


class BackgroundQuizService:
    """Generate and evaluate character background quizzes."""

    def __init__(self, agent: AIAgent) -> None:
        self.agent = agent

    def _read_background_docs(self) -> str:
        base = Path("docs/backgrounds/iron_accord")
        parts: list[str] = []
        for md in sorted(base.glob("*.md")):
            try:
                parts.append(md.read_text(encoding="utf-8"))
            except Exception as exc:  # pragma: no cover - unexpected I/O error
                logger.error("Failed reading %s: %s", md, exc)
        return "\n\n".join(parts)

    async def generate_questions(self) -> List[Dict[str, Any]]:
        """Return a list of quiz questions generated from the background docs."""
        lore = self._read_background_docs()
        prompt = (
            "Using the following background descriptions, craft five multiple-choice "
            "questions to determine which background best suits a player. "
            "Each question should include four short answer choices. "
            "Respond with JSON using the key 'questions' containing a list of "
            "objects with 'text' and 'choices'.\n\n"
            f"BACKGROUND INFO:\n{lore}"
        )
        try:
            text = await self.agent.get_completion(prompt)
        except Exception as exc:  # pragma: no cover - network/model failure
            logger.error("Quiz generation failed: %s", exc, exc_info=True)
            return []

        try:
            data = extract_json_from_llm(text)
            return data.get("questions", [])
        except Exception:
            logger.error("Invalid JSON from LLM: %s", text)
            return []

    async def evaluate_answers(
        self, questions: List[Dict[str, Any]], answers: List[str]
    ) -> Dict[str, Any] | None:
        """Return the chosen background and explanation based on player answers."""
        qa_lines = []
        for idx, (q, ans) in enumerate(zip(questions, answers)):
            qa_lines.append(f"Q{idx+1}: {q.get('text', '')}")
            qa_lines.append(f"A{idx+1}: {ans}")
        prompt = (
            "Given the following quiz questions and player answers, choose the "
            "most fitting background from the Iron Accord backgrounds. "
            "Respond only with JSON containing 'background' and 'explanation'.\n\n"
            + "\n".join(qa_lines)
        )
        try:
            text = await self.agent.get_completion(prompt)
        except Exception as exc:  # pragma: no cover - network/model failure
            logger.error("Quiz evaluation failed: %s", exc, exc_info=True)
            return None

        try:
            return extract_json_from_llm(text)
        except Exception:
            logger.error("Invalid JSON from LLM: %s", text)
            return None
