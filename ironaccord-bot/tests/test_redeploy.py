import pytest

discord = pytest.importorskip("discord")

from importlib import import_module
bot_module = import_module('ironaccord-bot.bot')


class DummyTree:
    def __init__(self):
        self.cleared = False
        self.synced = False

    async def clear_commands(self, guild=None):
        self.cleared = True
        return []

    async def sync(self):
        self.synced = True
        return []


class DummyUser:
    name = "Test"
    id = 1


@pytest.mark.asyncio
async def test_on_ready_clears_when_redeploy(monkeypatch):
    dummy_bot = type("Bot", (), {})()
    dummy_bot.user = DummyUser()
    dummy_bot.tree = DummyTree()
    dummy_bot.redeploy = True

    monkeypatch.setattr(bot_module, "bot", dummy_bot)

    await bot_module.on_ready()

    assert dummy_bot.tree.cleared
    assert dummy_bot.tree.synced


@pytest.mark.asyncio
async def test_on_ready_no_clear_without_flag(monkeypatch):
    dummy_bot = type("Bot", (), {})()
    dummy_bot.user = DummyUser()
    dummy_bot.tree = DummyTree()
    dummy_bot.redeploy = False

    monkeypatch.setattr(bot_module, "bot", dummy_bot)

    await bot_module.on_ready()

    assert not dummy_bot.tree.cleared
    assert dummy_bot.tree.synced


def test_redeploy_default_false():
    bot = bot_module.IronAccordBot()
    assert bot.redeploy is False

