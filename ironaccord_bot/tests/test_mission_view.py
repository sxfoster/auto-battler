import pytest

discord = pytest.importorskip("discord")

from ironaccord_bot.views.mission_view import MissionView
from ironaccord_bot.services.mission_engine_service import MissionEngineService


class DummyResponse:
    def __init__(self):
        self.kwargs = None

    async def edit_message(self, **kwargs):
        self.kwargs = kwargs


class DummyInteraction:
    def __init__(self):
        self.response = DummyResponse()
        self.followup = DummyResponse()
        self.edit_kwargs = None

    async def edit_original_response(self, **kwargs):
        self.edit_kwargs = kwargs


@pytest.mark.asyncio
async def test_choice_advances_scene(monkeypatch):
    class DummyService(MissionEngineService):
        def __init__(self):
            pass
        async def advance_mission(self, uid, choice):
            return {"text": "next", "status": "complete"}

    service = DummyService()
    view = MissionView(service, 1, "scene", ["A", "B"])
    interaction = DummyInteraction()
    button = view.children[0]
    await button.callback(interaction)

    assert interaction.response.kwargs["view"] is view
    assert interaction.edit_kwargs["content"] == "next"


@pytest.mark.asyncio
async def test_update_scene_repopulates_buttons():
    service = type("S", (), {"advance_mission": lambda *a, **k: None})()
    view = MissionView(service, 1, "one", ["A", "B"])
    view.update_scene("two", ["X"])
    assert view.narrative_text == "two"
    assert view.choices == ["X"]
    assert len(view.children) == 1
