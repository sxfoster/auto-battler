import pytest
pytest.importorskip("aiomysql")

discord = pytest.importorskip("discord")
from discord.ext import commands
from ironaccord_bot.cogs import mission

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
        self.user = type("User", (), {"id": 1})()
        self.response = DummyResponse()
        self.followup = DummyFollowup()

@pytest.mark.asyncio
async def test_mission_create(monkeypatch):
    bot = commands.Bot(command_prefix="!", intents=discord.Intents.none())

    class DummyGen:
        def __init__(self):
            self.called = False
            self.pid = None
        async def _collect_player_context(self, did):
            self.pid = did
            return {"level": 1}
        async def generate(self, rt, rd, ctx):
            self.called = True
            self.ctx = ctx
            return {"id": 1}

    bot.mission_generator = DummyGen()
    cog = mission.MissionCog(bot)
    interaction = DummyInteraction()

    await cog.create(interaction)

    assert interaction.response.deferred
    assert interaction.followup.called
    assert bot.mission_generator.called
    assert bot.mission_generator.pid == str(interaction.user.id)
