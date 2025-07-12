import pytest

from services.opening_scene_service import OpeningSceneService


@pytest.mark.asyncio
async def test_generate_opening(monkeypatch):
    calls = {}

    def fake_get_entity(self, name):
        calls.setdefault('entities', []).append(name)
        return {'name': name}

    async def fake_get_completion(self, prompt):
        calls['prompt'] = prompt
        return '{"scene": "start", "question": "do?", "choices": ["a", "b"]}'

    def fake_prompt(self, loc, npc):
        calls['prompt_args'] = (loc, npc)
        return 'PROMPT'

    rag = type('R', (), {'get_entity_by_name': fake_get_entity})()
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
    assert calls['entities'] == ['Brasshaven', 'Edraz']


@pytest.mark.asyncio
async def test_generate_opening_failure(monkeypatch):
    async def fake_get_completion(self, prompt):
        raise RuntimeError('fail')

    rag = type('R', (), {'get_entity_by_name': lambda self, n: {}})()
    def fake_prompt(self, loc, npc):
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

    rag = type('R', (), {'get_entity_by_name': lambda self, n: {}})()
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
