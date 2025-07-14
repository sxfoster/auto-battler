import pytest
from ironaccord_bot.models import player_service


@pytest.mark.asyncio
async def test_set_player_state_logs(monkeypatch):
    messages = []
    monkeypatch.setattr(player_service.logger, "info", lambda msg, *a: messages.append(msg % a))
    await player_service.set_player_state(5, "busy")
    assert any("set_player_state" in m for m in messages)


@pytest.mark.asyncio
async def test_get_player_state_returns_none(monkeypatch):
    messages = []
    monkeypatch.setattr(player_service.logger, "info", lambda msg, *a: messages.append(msg % a))
    state = await player_service.get_player_state(1)
    assert state is None

