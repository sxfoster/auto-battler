import pytest
pytest.importorskip("aiomysql")

from ironaccord_bot.models import player_service

class DummyDB:
    def __init__(self):
        self.calls = []
    async def query(self, sql, params=None):
        self.calls.append((sql, params))
        if sql.startswith('SELECT'):
            return {'rows': [{'state': 'idle'}]}
        return {'rows': [], 'insertId': 1}

db = DummyDB()

@pytest.mark.asyncio
async def test_set_player_state(monkeypatch):
    monkeypatch.setattr(player_service, 'db', db)
    db.calls.clear()
    await player_service.set_player_state(5, 'busy')
    assert db.calls[0] == ('UPDATE players SET state = %s WHERE id = %s', ['busy', 5])

@pytest.mark.asyncio
async def test_get_player_state(monkeypatch):
    monkeypatch.setattr(player_service, 'db', db)
    state = await player_service.get_player_state(1)
    assert state == 'idle'

