import pytest

discord = pytest.importorskip("discord")
from discord.ext import commands
from ironaccord_bot.cogs import start

class DummyResponse:
    def __init__(self):
        self.called = False
        self.kwargs = None

    async def send_message(self, *args, **kwargs):
        self.called = True
        self.kwargs = kwargs

class DummyMessage:
    pass

class DummyInteraction:
    def __init__(self):
        self.user = type("User", (), {"id": 1, "name": "Test", "display_name": "Test"})()
        self.response = DummyResponse()
        self.message = DummyMessage()

    async def original_response(self):
        return self.message

@pytest.mark.asyncio
async def test_start_cog_returns_view(monkeypatch):
    bot = commands.Bot(command_prefix="!", intents=discord.Intents.none())
    cog = start.StartCog(bot)

    called = {}

    class DummyView(start.AdventureView):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, **kwargs)
            called["created"] = True

        async def _handle_next_phase(self, interaction):
            called["interaction"] = interaction

    monkeypatch.setattr(start, "AdventureView", DummyView)
    interaction = DummyInteraction()

    await cog.start.callback(cog, interaction)

    assert interaction.response.called
    assert interaction.response.kwargs.get("ephemeral") is True
    assert called.get("created")
    assert called.get("interaction") is interaction.message
