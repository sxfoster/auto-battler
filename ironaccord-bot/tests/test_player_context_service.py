import pytest
from importlib import import_module
player_context_service = import_module('ironaccord-bot.services.player_context_service')
mission_service = import_module('ironaccord-bot.models.mission_service')
database = import_module('ironaccord-bot.models.database')

pytest.importorskip("aiomysql")

@pytest.mark.asyncio
async def test_gather_queries_tables(monkeypatch):
    calls = []

    async def fake_get_player_id(did):
        calls.append(('pid', did))
        return 1

    async def fake_query(sql, params=None):
        calls.append(sql)
        if 'FROM players' in sql:
            return {'rows': [{'level': 3, 'background': 'tinkerer', 'location': 'town'}]}
        if 'FROM user_stats' in sql:
            return {'rows': [{'stat': 'MGT', 'value': 2}]}
        if 'FROM codex_entries' in sql:
            return {'rows': [{'entry_key': 'intro'}]}
        if 'FROM user_flags' in sql:
            return {'rows': [{'flag': 'Injured'}]}
        return {'rows': []}

    monkeypatch.setattr(mission_service, 'get_player_id', fake_get_player_id)
    monkeypatch.setattr(database, 'query', fake_query)

    ctx = await player_context_service.gather_player_context('123')

    assert ctx == {
        'level': 3,
        'stats': {'MGT': 2},
        'codex': ['intro'],
        'background': 'tinkerer',
        'location': 'town',
        'flags': ['Injured'],
    }
    assert any('FROM players' in q for q in calls if isinstance(q, str))
    assert any('FROM user_stats' in q for q in calls if isinstance(q, str))
    assert any('FROM codex_entries' in q for q in calls if isinstance(q, str))
    assert any('FROM user_flags' in q for q in calls if isinstance(q, str))

@pytest.mark.asyncio
async def test_gather_no_player(monkeypatch):
    async def fake_get_player_id(did):
        return None

    monkeypatch.setattr(mission_service, 'get_player_id', fake_get_player_id)
    ctx = await player_context_service.gather_player_context('x')
    assert ctx is None
