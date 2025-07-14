import pytest

from services.opening_scene_service import OpeningSceneService


@pytest.mark.asyncio
async def test_generate_opening(monkeypatch):
    calls = {}

    def fake_get(self, name, typ):
        calls.setdefault('get', []).append((name, typ))
        return {'name': name}

    async def fake_get_completion(self, prompt):
        calls['prompt'] = prompt
        return '{"scene": "start", "question": "do?", "choices": ["a", "b"]}'

    def fake_prompt(self, location, npc):
        calls['prompt_args'] = (location, npc)
        return 'PROMPT'

    rag = type('R', (), {'get_entity_by_name': fake_get})()
    agent = type('A', (), {
        'get_completion': fake_get_completion,
        'get_structured_scene_prompt': fake_prompt,
    })()

    service = OpeningSceneService(agent, rag)
    result = await service.generate_opening('brave hero')

    assert result == {
        'scene': 'start',
        'question': 'do?',
        'choices': ['a', 'b']
    }
    assert calls['prompt'] == 'PROMPT'
    assert calls['prompt_args'][0]['name'] == 'Brasshaven'
    assert calls['prompt_args'][1]['name'] == 'Edraz'
    assert ('Brasshaven', 'Location') in calls['get']
    assert ('Edraz', 'NPC') in calls['get']


@pytest.mark.asyncio
async def test_generate_opening_failure(monkeypatch):
    async def fake_get_completion(self, prompt):
        raise RuntimeError('fail')

    rag = type('R', (), {'get_entity_by_name': lambda *a, **k: {}})()
    def fake_prompt(self, location, npc):
        return 'PROMPT'
    agent = type('A', (), {
        'get_completion': fake_get_completion,
        'get_structured_scene_prompt': fake_prompt,
    })()

    service = OpeningSceneService(agent, rag)
    with pytest.raises(RuntimeError):
        await service.generate_opening('hero')


@pytest.mark.asyncio
async def test_generate_opening_parses_malformed_json(monkeypatch):
    async def fake_get_completion(self, prompt):
        return 'text before {"scene": "start", "question": "do?", "choices": []} text after'

    rag = type('R', (), {'get_entity_by_name': lambda *a, **k: {}})()
    agent = type('A', (), {
        'get_completion': fake_get_completion,
        'get_structured_scene_prompt': lambda self, d, c: 'PROMPT',
    })()

    service = OpeningSceneService(agent, rag)
    result = await service.generate_opening('hero')
    assert result == {
        'scene': 'start',
        'question': 'do?',
        'choices': []
    }
