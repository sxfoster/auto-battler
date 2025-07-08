import pytest
pytest.importorskip("aiomysql")

from ironaccord_bot.models import character_service

class DummyDB:
    def __init__(self):
        self.calls = []
    async def query(self, sql, params=None):
        self.calls.append((sql, params))
        return {'rows': [], 'insertId': 7}

db = DummyDB()

@pytest.mark.asyncio
async def test_insert_character(monkeypatch):
    monkeypatch.setattr(character_service, 'db', db)
    db.calls.clear()
    insert_id = await character_service.insert_character('Alice', 'Brasshaven', 'tinker')
    assert insert_id == 7
    assert db.calls[0] == (
        'INSERT INTO characters (name, origin, skill) VALUES (%s, %s, %s)',
        ['Alice', 'Brasshaven', 'tinker']
    )
