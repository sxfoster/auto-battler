import pytest

from services.opening_scene_service import OpeningSceneService


@pytest.mark.asyncio
async def test_generate_opening(monkeypatch):
    calls = {}

    def fake_query(self, q, k=3):
        calls['query'] = q
        return [type('D', (), {'page_content': 'lore bit'})()]

    async def fake_get_narrative(self, prompt):
        calls['prompt'] = prompt
        return '{"scene": "start", "question": "do?", "choices": ["a", "b"]}'

    rag = type('R', (), {'query': fake_query})()
    agent = type('A', (), {'get_narrative': fake_get_narrative})()

    service = OpeningSceneService(agent, rag)
    result = await service.generate_opening('brave hero')

    assert result == {
        'scene': 'start',
        'question': 'do?',
        'choices': ['a', 'b']
    }
    assert 'brave hero' in calls['prompt']
    assert 'lore bit' in calls['prompt']
    assert 'Adopt the persona of Edraz' in calls['prompt']
    assert calls['query'] == 'brave hero'


@pytest.mark.asyncio
async def test_generate_opening_failure(monkeypatch):
    async def fake_get_narrative(self, prompt):
        raise RuntimeError('fail')

    rag = type('R', (), {'query': lambda q, k=3: []})()
    agent = type('A', (), {'get_narrative': fake_get_narrative})()

    service = OpeningSceneService(agent, rag)
    assert await service.generate_opening('hero') is None
