import pytest
pytest.importorskip("aiomysql")

from services.mission_generator import MissionGenerator
from models import mission_service, database

@pytest.mark.asyncio
async def test_generate_returns_json(monkeypatch):
    calls = {}

    async def fake_get_player_id(did):
        calls['pid'] = did
        return 1

    async def fake_query(sql, params=None):
        calls.setdefault('queries', []).append(sql)
        if 'FROM players' in sql:
            return {'rows': [{'level': 2}]}
        return {'rows': []}

    def fake_rag_query(q, k=5):
        calls['rag'] = True
        return ['lore']

    async def fake_get_narrative(self, prompt):
        calls['prompt'] = prompt
        return '{"id":1,"name":"test","intro":"hi","rounds":[],"rewards":{},"codexFragment":null}'

    monkeypatch.setattr(mission_service, 'get_player_id', fake_get_player_id)
    monkeypatch.setattr(database, 'query', fake_query)
    rag = type('R', (), {'query': fake_rag_query})()
    agent = type('A', (), {'get_narrative': fake_get_narrative})()

    gen = MissionGenerator(agent, rag)
    context = await gen._collect_player_context('123')
    mission = await gen.generate('basic', 'find stuff', context)

    assert mission == {
        "id": 1,
        "name": "test",
        "intro": "hi",
        "rounds": [],
        "rewards": {},
        "codexFragment": None,
    }
    assert calls['pid'] == '123'
    assert 'prompt' in calls

@pytest.mark.asyncio
async def test_invalid_json(monkeypatch):
    async def fake_get_player_id(did):
        return 1

    async def fake_query(sql, params=None):
        return {'rows': []}

    async def fake_get_narrative(self, prompt):
        return 'not json'

    monkeypatch.setattr(mission_service, 'get_player_id', fake_get_player_id)
    monkeypatch.setattr(database, 'query', fake_query)
    agent = type('A', (), {'get_narrative': fake_get_narrative})()
    gen = MissionGenerator(agent, None)
    context = await gen._collect_player_context('x')
    assert await gen.generate('basic', 'info', context) is None
