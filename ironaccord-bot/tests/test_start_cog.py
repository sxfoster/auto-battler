import pytest

discord = pytest.importorskip("discord")
from discord.ext import commands
from ironaccord_bot.cogs import start


class DummyResponse:
    def __init__(self):
        self.kwargs = None

    async def send_message(self, *args, **kwargs):
        self.kwargs = kwargs

class DummyInteraction:
    def __init__(self):
        self.user = type("User", (), {"id": 1, "name": "Test", "display_name": "Test"})()
        self.response = DummyResponse()
        self.followup = None

@pytest.mark.asyncio
async def test_start_cog_returns_view(monkeypatch):
    bot = commands.Bot(command_prefix="!", intents=discord.Intents.none())
    bot.rag_service = None
    cog = start.StartCog(bot)

    interaction = DummyInteraction()

    await cog.start.callback(cog, interaction)

    assert isinstance(interaction.response.kwargs["view"], start.OracleView)
    assert interaction.response.kwargs["ephemeral"] is True


class DummyFollowup:
    def __init__(self):
        self.kwargs = None

    async def send(self, *args, **kwargs):
        self.kwargs = kwargs


class DummyInteraction2:
    def __init__(self):
        self.user = type("User", (), {"id": 2, "display_name": "Hero"})()
        self.followup = DummyFollowup()


class DummyInteraction3:
    def __init__(self):
        async def edit_message(*args, **kwargs):
            pass
        self.response = type("Resp", (), {"edit_message": edit_message})()
        self.followup = DummyFollowup()
        self.kwargs = None

    async def edit_original_response(self, **kwargs):
        self.kwargs = kwargs


@pytest.mark.asyncio
async def test_handle_character_description(monkeypatch):
    bot = commands.Bot(command_prefix="!", intents=discord.Intents.none())
    bot.rag_service = None
    cog = start.StartCog(bot)

    class DummyService:
        called = None

        def __init__(self, agent, rag):
            pass

        async def generate_opening(self, desc):
            DummyService.called = desc
            return {
                "scene": "begin", 
                "question": "what do?", 
                "choices": ["a", "b"]
            }

    class DummyView:
        def __init__(self, agent, scene, question, choices):
            self.agent = agent
            self.scene = scene
            self.question = question
            self.choices = choices

    monkeypatch.setattr(start, "OpeningSceneService", DummyService)
    monkeypatch.setattr(start, "OpeningSceneView", DummyView)

    interaction = DummyInteraction2()

    await cog.handle_character_description(interaction, "desc")

    assert DummyService.called == "desc"
    assert interaction.followup.kwargs["ephemeral"] is True
    assert isinstance(interaction.followup.kwargs["view"], DummyView)
    assert interaction.followup.kwargs["view"].choices == ["a", "b"]


@pytest.mark.asyncio
async def test_oracle_view_compiles_answers(monkeypatch):
    bot = commands.Bot(command_prefix="!", intents=discord.Intents.none())
    cog = start.StartCog(bot)

    called = {}

    async def fake_handle(self, inter, summary):
        called["summary"] = summary

    monkeypatch.setattr(start.StartCog, "handle_character_description", fake_handle)

    view = start.OracleView(cog)
    inter = DummyInteraction3()

    # simulate clicking first option for each question
    for _ in range(len(view.QUESTIONS)):
        button = view.children[0]
        await button.callback(inter)

    expected = (
        "This person sees the old world as a tragic loss. "
        "They share what little you have with those in need. "
        "They seek the truth behind conspiracies. "
        "They value unwavering loyalty in a companion."
    )
    assert called["summary"] == expected
