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

    async def fake_gen(self):
        return [{"text": "q1", "choices": ["a", "b"]}]

    monkeypatch.setattr(start.BackgroundQuizService, "generate_questions", fake_gen)

    await cog.start.callback(cog, interaction)

    assert isinstance(interaction.response.kwargs["view"], start.BackgroundQuizView)
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
async def test_background_view_compiles_answers(monkeypatch):
    bot = commands.Bot(command_prefix="!", intents=discord.Intents.none())
    cog = start.StartCog(bot)

    called = {}

    async def fake_eval(self, q, a):
        return {"background": "scout", "explanation": "because"}

    monkeypatch.setattr(start.BackgroundQuizService, "evaluate_answers", fake_eval)

    async def fake_result(self, inter, bg, exp):
        called.update({"bg": bg, "exp": exp})

    monkeypatch.setattr(start.StartCog, "handle_background_result", fake_result)

    questions = [{"text": "q1", "choices": ["a", "b"]}, {"text": "q2", "choices": ["a", "b"]}]
    view = start.BackgroundQuizView(cog, questions)
    inter = DummyInteraction3()

    for _ in range(len(questions)):
        button = view.children[0]
        await button.callback(inter)

    assert called["bg"] == "scout"
