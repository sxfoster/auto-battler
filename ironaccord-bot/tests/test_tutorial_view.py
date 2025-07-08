import pytest
pytest.importorskip("aiomysql")

from ironaccord_bot import tutorial

class DummyService:
    def __init__(self):
        self.calls = []
    async def insert_character(self, name, origin, skill):
        self.calls.append((name, origin, skill))

@pytest.mark.asyncio
async def test_run_phase_8_calls_insert(monkeypatch):
    svc = DummyService()
    monkeypatch.setattr(tutorial, 'character_service', svc)
    view = tutorial.TutorialView()
    await view.run_phase_8('Bob', 'Wasteland', 'survival')
    assert svc.calls == [('Bob', 'Wasteland', 'survival')]
