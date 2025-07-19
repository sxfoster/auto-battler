import json
import pytest

from ironaccord_bot.services import background_quiz_service as bqs


@pytest.mark.asyncio
async def test_start_quiz_parses_json(monkeypatch, tmp_path):
    # prepare some fake background text
    backgrounds = {f"BG{i}": f"lore {i}" for i in range(3)}

    async def fake_gm(self, prompt):
        return json.dumps(
            {
                "background_map": {"A": "One", "B": "Two", "C": "Three"},
                "questions": [{"question": "Q1", "answers": ["A. a", "B. b", "C. c"]}],
            }
        )

    monkeypatch.setattr(bqs.OllamaService, "get_gm_response", fake_gm)

    service = bqs.BackgroundQuizService(bqs.OllamaService())
    session = await service.start_quiz(1, backgrounds)

    assert session is not None
    assert session.get_current_question_text().startswith("Q1")


@pytest.mark.asyncio
async def test_start_quiz_handles_markdown(monkeypatch):
    backgrounds = {f"BG{i}": f"lore {i}" for i in range(3)}

    async def fake_gm(self, prompt):
        data = json.dumps({
            "background_map": {"A": "One", "B": "Two", "C": "Three"},
            "questions": [{"question": "Q1", "answers": ["A) a", "B) b"]}],
        })
        return f"Here you go:\n```json\n{data}\n```"

    monkeypatch.setattr(bqs.OllamaService, "get_gm_response", fake_gm)

    service = bqs.BackgroundQuizService(bqs.OllamaService())
    session = await service.start_quiz(1, backgrounds)

    assert session is not None
    assert session.get_current_question_text().startswith("Q1")


def test_evaluate_result():
    service = bqs.BackgroundQuizService(bqs.OllamaService())
    session = bqs.QuizSession(
        questions=[{"question": "Q1", "answers": ["A", "B", "C"]}],
        background_map={"A": "Alpha", "B": "Beta", "C": "Gamma"},
        background_text={"A": "a", "B": "b", "C": "c"},
    )
    session.answers = ["B", "B", "A"]
    service.active_quizzes[1] = session

    key, name, returned_session = service.evaluate_result(1)

    assert key == "B"
    assert name == "Beta"
    assert returned_session is session
    assert 1 in service.active_quizzes

    service.cleanup_quiz_session(1)
    assert 1 not in service.active_quizzes

