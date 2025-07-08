import pytest

from python_bot.commands import ping


class Interaction:
    def __init__(self):
        self.called = False
        self.kwargs = None

    async def reply(self, **kwargs):
        self.called = True
        self.kwargs = kwargs


@pytest.mark.asyncio
async def test_ping_command_replies():
    interaction = Interaction()
    await ping.execute(interaction)
    assert interaction.called
    assert interaction.kwargs.get("ephemeral") is True
