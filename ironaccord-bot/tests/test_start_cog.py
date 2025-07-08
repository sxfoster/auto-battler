import pytest
import requests

discord = pytest.importorskip("discord")
from discord.ext import commands
from ironaccord_bot.cogs import start

class DummyFollowup:
    def __init__(self):
        self.args = None
        self.kwargs = None
    async def send(self, *args, **kwargs):
        self.args = args
        self.kwargs = kwargs

class DummyResponse:
    async def defer(self, *args, **kwargs):
        pass

class DummyInteraction:
    def __init__(self):
        self.user = type("User", (), {"id": 1, "name": "Test"})()
        self.response = DummyResponse()
        self.followup = DummyFollowup()

@pytest.mark.asyncio
async def test_start_cog_connection_error(monkeypatch):
    bot = commands.Bot(command_prefix="!", intents=discord.Intents.none())
    cog = start.StartCog(bot)

    def fail_query(self, prompt, max_tokens=200):
        raise requests.exceptions.ConnectionError()

    monkeypatch.setattr(start.MixtralAgent, "query", fail_query, raising=False)
    interaction = DummyInteraction()

    await cog.start.callback(cog, interaction)

    content = interaction.followup.args[0] if interaction.followup.args else ""
    assert "Could not connect" in content


@pytest.mark.asyncio
async def test_start_cog_returns_view(monkeypatch):
    bot = commands.Bot(command_prefix="!", intents=discord.Intents.none())
    cog = start.StartCog(bot)

    def fake_query(self, prompt, max_tokens=200):
        return "intro"

    monkeypatch.setattr(start.MixtralAgent, "query", fake_query, raising=False)
    interaction = DummyInteraction()

    await cog.start.callback(cog, interaction)

    view = interaction.followup.kwargs.get("view")
    assert isinstance(view, start.SimpleTutorialView)
