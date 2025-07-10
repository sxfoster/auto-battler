import pytest
pytest.importorskip("aiomysql")

discord = pytest.importorskip("discord")
from discord.ext import commands
from ironaccord_bot.cogs import mission
from models import mission_service as mission_service

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
        async def generate(self, did):
            self.called = True
            return {"id": 1}

    bot.mission_generator = DummyGen()
    cog = mission.MissionCog(bot)
    interaction = DummyInteraction()

    called = {}

    async def fake_start(self, inter, mission_json, *, followup=False):
        called["mission"] = mission_json
        called["followup"] = followup

    monkeypatch.setattr(mission.MissionCog, "start_mission_from_json", fake_start)

    await cog.create(interaction)

    assert interaction.response.deferred
    assert called.get("mission") == {"id": 1}
    assert called.get("followup") is True
    assert bot.mission_generator.called


class DummySend:
    def __init__(self):
        self.called = False
        self.kwargs = None

    async def send_message(self, **kwargs):
        self.called = True
        self.kwargs = kwargs


class DummyThread:
    def __init__(self):
        self.messages = []

    async def send(self, msg, view=None):
        self.messages.append(msg)


class DummyChannel:
    def __init__(self):
        self.thread = DummyThread()

    async def create_thread(self, name, auto_archive_duration=60):
        return self.thread


class DummyInteraction2:
    def __init__(self):
        self.user = type("User", (), {"id": 2})()
        self.response = DummySend()
        self.followup = DummySend()
        self.channel = DummyChannel()


@pytest.mark.asyncio
async def test_start_mission_progress(monkeypatch):
    bot = commands.Bot(command_prefix="!", intents=discord.Intents.none())
    cog = mission.MissionCog(bot)

    mission_json = {
        "id": 1,
        "name": "dyn",
        "intro": "hi",
        "rounds": [
            {"text": "r1", "options": [{"text": "a"}]},
            {"text": "r2", "options": [{"text": "b"}]},
        ],
    }

    async def fake_get_player_id(did):
        return 5

    async def fake_start_mission(pid, mid):
        return 11

    records = []

    def fake_record_choice(log_id, round_idx, choice_idx, durability_delta=0):
        records.append((round_idx, choice_idx))

    async def fake_complete(log_id, outcome, rewards, codex, player_id):
        records.append(("done", outcome))

    async def fake_resolve(pid, option):
        return {"tier": "success"}

    class DummyView:
        def __init__(self, user, options):
            self.choice = 0

        async def wait(self):
            pass

    monkeypatch.setattr(mission_service, "get_player_id", fake_get_player_id)
    monkeypatch.setattr(mission_service, "start_mission", fake_start_mission)
    monkeypatch.setattr(mission_service, "record_choice", fake_record_choice)
    monkeypatch.setattr(mission_service, "complete_mission", fake_complete)
    monkeypatch.setattr(mission, "resolve_choice", fake_resolve)
    monkeypatch.setattr(mission, "OptionView", DummyView)

    interaction = DummyInteraction2()

    await cog.start_mission_from_json(interaction, mission_json)

    assert records == [(0, 0), (1, 0), ("done", "success")]
    assert interaction.response.called
