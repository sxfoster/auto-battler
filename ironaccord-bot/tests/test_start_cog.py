import pytest

discord = pytest.importorskip("discord")
from discord.ext import commands
from ironaccord_bot.cogs import start


class DummyResponse:
    def __init__(self):
        self.modal = None

    async def send_modal(self, modal):
        self.modal = modal

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

    assert isinstance(interaction.response.modal, start.CharacterPromptModal)
