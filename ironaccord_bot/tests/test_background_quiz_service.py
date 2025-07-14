import json
import pytest
from pathlib import Path

from ironaccord_bot.services import background_quiz_service as bqs


@pytest.mark.asyncio
async def test_start_quiz_parses_json(monkeypatch, tmp_path):
    # create three dummy background files
    for i in range(3):
        (tmp_path / f"bg{i}.md").write_text(f"lore {i}")

    monkeypatch.setattr(bqs, "BACKGROUNDS_PATH", Path(tmp_path))

    async def fake_gm(self, prompt):
        return json.dumps(
            {
                "background_map": {"A": "One", "B": "Two", "C": "Three"},
                "questions": [{"question": "Q1", "answers": ["A. a", "B. b", "C. c"]}],
            }
        )

    monkeypatch.setattr(bqs.OllamaService, "get_gm_response", fake_gm)

    service = bqs.BackgroundQuizService()
    session = await service.start_quiz(1)

    assert session is not None
    assert session.get_current_question_text().startswith("Q1")


@pytest.mark.asyncio
async def test_evaluate_result(monkeypatch):
    service = bqs.BackgroundQuizService()
    session = bqs.QuizSession(
        questions=[{"question": "Q1", "answers": ["A", "B", "C"]}],
        background_map={"A": "Alpha", "B": "Beta", "C": "Gamma"},
        background_text={"A": "a", "B": "b", "C": "c"},
    )
    session.answers = ["B", "B", "A"]
    service.active_quizzes[1] = session

    async def fake_narrative(self, prompt):
        return "final"

    monkeypatch.setattr(bqs.OllamaService, "get_narrative", fake_narrative)

    result = await service.evaluate_result(1)

    assert result == "final"
    assert 1 not in service.active_quizzes

