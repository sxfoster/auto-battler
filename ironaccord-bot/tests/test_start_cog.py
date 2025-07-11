import pytest

discord = pytest.importorskip("discord")
from discord.ext import commands
from ironaccord_bot.cogs import start


class DummyResponse:
    def __init__(self):
        self.deferred = False
        self.kwargs = None

    async def defer(self, *args, **kwargs):
        self.deferred = True
        self.kwargs = kwargs

class DummyFollowup:
    def __init__(self):
        self.called = False
        self.kwargs = None

    async def send(self, *args, **kwargs):
        self.called = True
        self.kwargs = kwargs

class DummyInteraction:
    def __init__(self):
        self.user = type("User", (), {"id": 1, "name": "Test", "display_name": "Test"})()
        self.response = DummyResponse()
        self.followup = DummyFollowup()

@pytest.mark.asyncio
async def test_start_cog_returns_view(monkeypatch):
    bot = commands.Bot(command_prefix="!", intents=discord.Intents.none())
    bot.rag_service = None
    cog = start.StartCog(bot)

    monkeypatch.setattr(start.random, "sample", lambda seq, k: ["A", "B"])
    interaction = DummyInteraction()

    await cog.start.callback(cog, interaction)

    assert interaction.response.deferred
    assert interaction.response.kwargs.get("ephemeral") is True
    assert interaction.followup.called
    assert interaction.followup.kwargs.get("ephemeral") is True
    assert isinstance(interaction.followup.kwargs.get("view"), start.BackgroundView)
