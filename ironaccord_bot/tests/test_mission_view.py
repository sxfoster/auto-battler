import pytest

discord = pytest.importorskip("discord")

from ironaccord_bot.views.mission_view import MissionView


class DummyService:
    def __init__(self):
        self.choice = None

    async def advance_mission(self, uid, choice):
        self.choice = choice
        return {"text": "next"}


class DummyResponse:
    def __init__(self):
        self.kwargs = None

    async def edit_message(self, **kwargs):
        self.kwargs = kwargs

    async def send(self, *args, **kwargs):
        self.kwargs = kwargs


class DummyInteraction:
    def __init__(self):
        self.user = type("U", (), {"id": 1})()
        self.response = DummyResponse()
        self.followup = DummyResponse()


@pytest.mark.asyncio
async def test_button_sends_choice():
    service = DummyService()
    choices = [
        {"id": 1, "text": "Option A"},
        {"id": 2, "text": "Option B"},
    ]
    view = MissionView(service, 1, "scene", choices)
    interaction = DummyInteraction()
    button = view.children[0]

    await button.callback(interaction)

    assert service.choice == "Option A"
    assert interaction.followup.kwargs is not None
    assert "**A.** Option A" in view.message_text
