import pytest
import asyncio

discord = pytest.importorskip("discord")

from ironaccord_bot.views.mission_view import MissionView


class DummyService:
    def __init__(self):
        self.choice = None

    async def _resolve_action_mechanics(self, uid, choice):
        self.choice = choice
        return {"outcome_summary": "short", "new_choices": ["X"]}

    async def _generate_narrative_description(self, uid, choice, mech):
        return "full"


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
        self.edited = None

    async def edit_original_response(self, **kwargs):
        self.edited = kwargs


@pytest.mark.asyncio
async def test_button_sends_choice(monkeypatch):
    service = DummyService()
    choices = [
        {"id": 1, "text": "Option A"},
        {"id": 2, "text": "Option B"},
    ]
    view = MissionView(service, 1, "scene", choices)
    interaction = DummyInteraction()
    button = view.children[0]

    def immediate(coro):
        return asyncio.get_event_loop().create_task(coro)

    monkeypatch.setattr(asyncio, "create_task", immediate)

    await button.callback(interaction)

    assert service.choice == "Option A"
    assert interaction.edited is not None
    assert "**A.** Option A" in view.message_text
