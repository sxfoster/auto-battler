import types
import pytest

pytest.importorskip("aiomysql")
from ironaccord_bot.models import database

class DummyCursor:
    def __init__(self, rows=None, description=True, lastrowid=1):
        self.rows = rows or []
        self.description = description
        self.lastrowid = lastrowid
        self.sql = None
        self.params = None

    async def execute(self, sql, params):
        self.sql = sql
        self.params = params

    async def fetchall(self):
        return self.rows

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        pass

class DummyConnection:
    def __init__(self, cursor):
        self._cursor = cursor

    def cursor(self, _):
        class Ctx:
            async def __aenter__(self_inner):
                return self._cursor
            async def __aexit__(self_inner, exc_type, exc, tb):
                pass
        return Ctx()

class DummyPool:
    def __init__(self, cursor):
        self._cursor = cursor
    def acquire(self):
        class Ctx:
            async def __aenter__(self_inner):
                return DummyConnection(self._cursor)
            async def __aexit__(self_inner, exc_type, exc, tb):
                pass
        return Ctx()

@pytest.mark.asyncio
async def test_query_fetches_rows(monkeypatch):
    database._pool = None
    cur = DummyCursor(rows=[{"x": 1}], description=True, lastrowid=42)
    pool = DummyPool(cur)
    async def fake_create_pool(**kwargs):
        return pool
    monkeypatch.setattr(database.aiomysql, "create_pool", fake_create_pool)

    result = await database.query("SELECT 1", [1])

    assert result == {"insertId": 42, "rows": [{"x": 1}]}
    assert cur.sql == "SELECT 1"
    assert cur.params == [1]

@pytest.mark.asyncio
async def test_query_handles_no_rows(monkeypatch):
    database._pool = None
    cur = DummyCursor(rows=[], description=None, lastrowid=3)
    pool = DummyPool(cur)
    async def fake_create_pool(**kwargs):
        return pool
    monkeypatch.setattr(database.aiomysql, "create_pool", fake_create_pool)

    result = await database.query("UPDATE", None)

    assert result == {"insertId": 3, "rows": []}
