import pytest
import discord
from discord.ext import commands

from ironaccord_bot.cogs import start
from ironaccord_bot.cogs import quiz


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
    quiz_cog = quiz.QuizCog(bot)
    await bot.add_cog(quiz_cog)
    cog = start.StartCog(bot)

    ctx = DummyCtx()

    monkeypatch.setattr(
        quiz_cog.content_service,
        "get_question_and_choices",
        lambda num: {
            "text": "Q1",
            "choices": [
                {"background": "a", "text": "A"},
                {"background": "b", "text": "B"},
                {"background": "c", "text": "C"},
            ],
        },
    )

    await cog.start.callback(cog, ctx)

    interaction = ctx.interaction
    assert interaction.response.args[0].startswith("Edraz is consulting")
    assert interaction.response.kwargs["ephemeral"] is True
    expected = "**Question 1/5:**\n\nQ1\n\n**A:** A\n**B:** B\n**C:** C\n"
    assert interaction.edited["content"] == expected
    assert isinstance(interaction.edited["view"], quiz.SimpleQuizView)

