import pytest
from importlib import import_module
MissionGenerator = import_module('ironaccord-bot.services.mission_generator').MissionGenerator

@pytest.mark.asyncio
async def test_generate_intro(monkeypatch):
    calls = {}

    def fake_rag_query(self, q, k=3):
        calls.setdefault('rag', []).append(q)
        return [type('D', (), {'page_content': 'lore'})()]

    async def fake_get_narrative(self, prompt):
        calls['prompt'] = prompt
        return 'scene'

    rag = type('R', (), {'query': fake_rag_query})()
    agent = type('A', (), {'get_narrative': fake_get_narrative})()

    gen = MissionGenerator(agent, rag)
    text = await gen.generate_intro('Scout')

    assert text == 'scene'
    assert 'world overview' in calls['rag'][0]


@pytest.mark.asyncio
async def test_generate_intro_failure(monkeypatch):
    async def fake_get_narrative(self, prompt):
        raise RuntimeError('fail')

    rag = type('R', (), {'query': lambda q, k=3: []})()
    agent = type('A', (), {'get_narrative': fake_get_narrative})()

    gen = MissionGenerator(agent, rag)
    assert await gen.generate_intro('Scout') is None
