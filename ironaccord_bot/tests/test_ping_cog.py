import pytest
discord = pytest.importorskip("discord")
from discord.ext import commands

from ironaccord_bot.cogs import ping

class DummySend:
    def __init__(self):
        self.called = False
        self.kwargs = None
    async def send_message(self, **kwargs):
        self.called = True
        self.kwargs = kwargs

class DummyInteraction:
    def __init__(self):
        self.response = DummySend()

@pytest.mark.asyncio
async def test_ping_cog_reply():
    bot = commands.Bot(command_prefix="!", intents=discord.Intents.none())
    cog = ping.PingCog(bot)
    interaction = DummyInteraction()
    await cog.ping.callback(cog, interaction)
    assert interaction.response.called
    assert interaction.response.kwargs.get("ephemeral") is True
