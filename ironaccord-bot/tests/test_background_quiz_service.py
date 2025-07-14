import pytest

from importlib import import_module
BackgroundQuizService = import_module('ironaccord-bot.services.background_quiz_service').BackgroundQuizService


@pytest.mark.asyncio
async def test_generate_questions_parses_extra_text():
    async def fake_get(self, prompt):
        return "Some intro {\"questions\": [{\"text\": \"q\", \"choices\": [\"a\", \"b\"]}]} more"

    agent = type('A', (), {'get_completion': fake_get})()
    service = BackgroundQuizService(agent)
    result = await service.generate_questions()
    assert result == [{"text": "q", "choices": ["a", "b"]}]


@pytest.mark.asyncio
async def test_evaluate_answers_parses_extra_text():
    async def fake_get(self, prompt):
        return "preface {\"background\": \"soldier\", \"explanation\": \"because\"} end"

    agent = type('A', (), {'get_completion': fake_get})()
    service = BackgroundQuizService(agent)
    result = await service.evaluate_answers([], [])
    assert result == {"background": "soldier", "explanation": "because"}
