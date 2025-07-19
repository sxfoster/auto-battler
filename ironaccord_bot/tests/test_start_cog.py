import pytest
import discord
from discord.ext import commands

from ironaccord_bot.cogs import start


class DummyResponse:
    def __init__(self):
        self.kwargs = None
        self.args = None

    async def send_message(self, *args, **kwargs):
        self.kwargs = kwargs
        self.args = args


class DummyInteraction:
    def __init__(self):
        self.user = type("User", (), {"id": 1})()
        self.response = DummyResponse()
        self.edited = None

    async def edit_original_response(self, **kwargs):
        self.edited = kwargs


class DummyCtx:
    def __init__(self):
        self.author = type("User", (), {"id": 1})()
        self.interaction = DummyInteraction()
        self.sent = None

    async def send(self, *args, **kwargs):
        self.sent = (args, kwargs)


@pytest.mark.asyncio
async def test_start_cog_sends_first_question(monkeypatch):
    bot = commands.Bot(command_prefix="!", intents=discord.Intents.none())
    cog = start.StartCog(bot)

    ctx = DummyCtx()

    monkeypatch.setattr(cog.quiz_service, "start_quiz", lambda uid: None)
    monkeypatch.setattr(
        cog.quiz_service,
        "get_next_question_for_user",
        lambda uid: {"text": "Q1", "choices": {"a": "A", "b": "B", "c": "C"}},
    )

    await cog.start.callback(cog, ctx)

    interaction = ctx.interaction
    assert interaction.response.args[0].startswith("Edraz is consulting")
    assert interaction.response.kwargs["ephemeral"] is True
    assert interaction.edited["content"] == "Q1"
    assert isinstance(interaction.edited["view"], start.QuizView)

