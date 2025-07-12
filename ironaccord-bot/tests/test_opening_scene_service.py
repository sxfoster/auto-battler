import pytest

from services.opening_scene_service import OpeningSceneService


@pytest.mark.asyncio
async def test_generate_opening(monkeypatch):
    calls = {}

    def fake_query(self, q, k=3):
        calls['query'] = q
        return 'lore bit'

    async def fake_get_completion(self, prompt):
        calls['prompt'] = prompt
        return '{"scene": "start", "question": "do?", "choices": ["a", "b"]}'

    def fake_prompt(self, desc, ctx):
        calls['prompt_args'] = (desc, ctx)
        return 'PROMPT'

    rag = type('R', (), {'query': fake_query})()
    agent = type('A', (), {
        'get_completion': fake_get_completion,
        'get_opening_scene_prompt': fake_prompt,
    })()

    service = OpeningSceneService(agent, rag)
    result = await service.generate_opening('brave hero')

    assert result == {
        'scene': 'start',
        'question': 'do?',
        'choices': ['a', 'b']
    }
    assert calls['prompt'] == 'PROMPT'
    assert calls['prompt_args'][0] == 'brave hero'
    assert 'lore bit' in calls['prompt_args'][1]
    assert calls['query'] == 'brave hero'


@pytest.mark.asyncio
async def test_generate_opening_failure(monkeypatch):
    async def fake_get_completion(self, prompt):
        raise RuntimeError('fail')

    rag = type('R', (), {'query': lambda q, k=3: ''})()
    def fake_prompt(self, desc, ctx):
        return 'PROMPT'
    agent = type('A', (), {
        'get_completion': fake_get_completion,
        'get_opening_scene_prompt': fake_prompt,
    })()

    service = OpeningSceneService(agent, rag)
    with pytest.raises(RuntimeError):
        await service.generate_opening('hero')


@pytest.mark.asyncio
async def test_generate_opening_parses_malformed_json(monkeypatch):
    async def fake_get_completion(self, prompt):
        return 'text before {"scene": "start", "question": "do?", "choices": []} text after'

    rag = type('R', (), {'query': lambda q, k=3: ''})()
    agent = type('A', (), {
        'get_completion': fake_get_completion,
        'get_opening_scene_prompt': lambda self, d, c: 'PROMPT',
    })()

    service = OpeningSceneService(agent, rag)
    result = await service.generate_opening('hero')
    assert result == {
        'scene': 'start',
        'question': 'do?',
        'choices': []
    }
