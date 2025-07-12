import pytest

from services.opening_scene_service import OpeningSceneService


@pytest.mark.asyncio
async def test_generate_opening(monkeypatch):
    calls = {}

    def fake_get_entity(self, name):
        calls.setdefault('entity_calls', []).append(name)
        return f'lore {name}'

    async def fake_get_completion(self, prompt):
        calls['prompt'] = prompt
        return '{"scene": "start", "question": "do?", "choices": ["a", "b"]}'

    def fake_prompt(self, desc, loc, npc):
        calls['prompt_args'] = (desc, loc, npc)
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
    assert calls['prompt_args'][0] == 'brave hero'
    assert calls['prompt_args'][1] == 'lore Brasshaven'
    assert calls['prompt_args'][2] == 'lore Edraz'
    assert calls['entity_calls'] == ['Brasshaven', 'Edraz']


@pytest.mark.asyncio
async def test_generate_opening_failure(monkeypatch):
    async def fake_get_completion(self, prompt):
        raise RuntimeError('fail')

    rag = type('R', (), {'get_entity_by_name': lambda n: ''})()
    def fake_prompt(self, desc, loc, npc):
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

    rag = type('R', (), {'get_entity_by_name': lambda n: ''})()
    agent = type('A', (), {
        'get_completion': fake_get_completion,
        'get_structured_scene_prompt': lambda self, d, l, n: 'PROMPT',
    })()

    service = OpeningSceneService(agent, rag)
    result = await service.generate_opening('hero')
    assert result == {
        'scene': 'start',
        'question': 'do?',
        'choices': []
    }
