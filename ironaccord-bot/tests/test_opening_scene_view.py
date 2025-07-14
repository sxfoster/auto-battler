import pytest

discord = pytest.importorskip("discord")

from importlib import import_module
OpeningSceneView = import_module('ironaccord-bot.views.opening_scene_view').OpeningSceneView


class DummyResponse:
    def __init__(self):
        self.kwargs = None

    async def edit_message(self, **kwargs):
        self.kwargs = kwargs


class DummyMessage:
    def __init__(self):
        self.kwargs = None

    async def edit(self, **kwargs):
        self.kwargs = kwargs


class DummyInteraction:
    def __init__(self):
        self.response = DummyResponse()
        self.message = DummyMessage()
        self.followup = DummyResponse()


@pytest.mark.asyncio
async def test_view_calls_summary_after_final_turn():
    calls = []

    async def fake_get_narrative(self, prompt):
        calls.append(prompt)
        if "Summarize" in prompt:
            return "the summary"
        return '{"scene": "s", "question": "q", "choices": ["a"]}'

    agent = type("Agent", (), {"get_narrative": fake_get_narrative})()
    view = OpeningSceneView(agent, "intro", "q", ["a"], turns=1)
    interaction = DummyInteraction()

    button = view.children[0]
    await button.callback(interaction)

    assert any("Summarize the events" in c for c in calls)
    assert "Your story has just begun." in interaction.message.kwargs["embed"].description
