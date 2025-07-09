import pytest

discord = pytest.importorskip("discord")
from discord.ext import commands
from ironaccord_bot.cogs import start


class DummyInteraction:
    def __init__(self):
        self.user = type("User", (), {"id": 1, "name": "Test", "display_name": "Test"})()

        class Resp:
            def __init__(self, outer):
                self.outer = outer
                self.deferred = False
                self.kwargs = None

            async def defer(self, *args, **kwargs):
                self.deferred = True
                self.kwargs = kwargs

        class Followup:
            def __init__(self, outer):
                self.outer = outer
                self.sent = False
                self.kwargs = None

            async def send(self, *args, **kwargs):
                self.sent = True
                self.kwargs = kwargs

        self.response = Resp(self)
        self.followup = Followup(self)

@pytest.mark.asyncio
async def test_start_cog_returns_view(monkeypatch):
    bot = commands.Bot(command_prefix="!", intents=discord.Intents.none())
    cog = start.StartCog(bot)

    called = {}

    class DummyView(start.AdventureView):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, **kwargs)
            called["created"] = True

    monkeypatch.setattr(start, "AdventureView", DummyView)

    async def fake_get_narrative(prompt):
        called["func"] = True
        return "story"

    monkeypatch.setattr(bot.agent, "get_narrative", fake_get_narrative)
    interaction = DummyInteraction()

    await cog.start.callback(cog, interaction)

    assert interaction.response.deferred
    assert interaction.followup.sent
    assert isinstance(interaction.followup.kwargs.get("view"), DummyView)
    assert called.get("created")
    assert called.get("func")
