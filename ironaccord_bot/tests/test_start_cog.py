import pytest
import discord
from discord.ext import commands

from ironaccord_bot.cogs import start


class DummyResponse:
    def __init__(self):
        self.kwargs = None
        self.deferred = False

    async def defer(self, *args, **kwargs):
        self.deferred = True
        self.kwargs = kwargs


class DummyFollowup:
    def __init__(self):
        self.kwargs = None

    async def send(self, *args, **kwargs):
        self.kwargs = kwargs


class DummyInteraction:
    def __init__(self):
        self.user = type("User", (), {"id": 1})()
        self.response = DummyResponse()
        self.followup = DummyFollowup()


@pytest.mark.asyncio
async def test_start_cog_sends_first_question(monkeypatch):
    bot = commands.Bot(command_prefix="!", intents=discord.Intents.none())
    cog = start.StartCog(bot)

    interaction = DummyInteraction()

    class DummySession:
        def get_current_question_text(self):
            return "Q1"

    async def fake_start(self, user_id):
        return DummySession()

    monkeypatch.setattr(start.BackgroundQuizService, "start_quiz", fake_start)

    await cog.start.callback(cog, interaction)

    assert interaction.response.deferred is True
    assert interaction.followup.kwargs["content"] == "Q1"
    assert isinstance(interaction.followup.kwargs["view"], start.BackgroundQuizView)
    assert interaction.followup.kwargs["ephemeral"] is True

