import logging
from typing import TYPE_CHECKING, Iterable

if TYPE_CHECKING:  # pragma: no cover - for type hints only
    from ai.ai_agent import AIAgent
    from services.rag_service import RAGService

logger = logging.getLogger(__name__)


class BackgroundQuizService:
    """Service responsible for generating quiz questions and evaluating answers."""

    def __init__(self, agent: 'AIAgent', rag_service: 'RAGService | None' = None) -> None:
        self.agent = agent
        self.rag_service = rag_service

    async def generate_questions(self) -> list[dict]:  # pragma: no cover - network
        """Return a list of quiz questions."""
        return []

    async def evaluate_answers(self, answers: Iterable[str]) -> str:  # pragma: no cover - network
        """Return a text summary based on the given answers."""
        return ""
