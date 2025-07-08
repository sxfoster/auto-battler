import pytest

from python_bot.utils import mission_engine
from python_bot import database


@pytest.mark.asyncio
async def test_resolve_choice_applies_stats_and_gear(monkeypatch):
    calls = []

    async def mock_query(sql, params):
        calls.append((sql, params))
        responses = [
            [{"stat": "MGT", "value": 3}],
            [{"equipped_weapon_id": 2, "equipped_armor_id": 3, "equipped_ability_id": None}],
            [{"name": "Sword"}],
            [{"name": "Plate Armor"}],
            [],
        ]
        return responses[len(calls) - 1]

    monkeypatch.setattr(database, "query", mock_query)
    monkeypatch.setattr(mission_engine.random, "randint", lambda a, b: 11)

    result = await mission_engine.resolve_choice(1, {"dc": 15, "stat": "MGT", "rewards": {"gold": 2}})

    assert calls[0] == (
        "SELECT stat, value FROM user_stats WHERE player_id = ?",
        [1],
    )
    assert calls[1] == (
        "SELECT equipped_weapon_id, equipped_armor_id, equipped_ability_id FROM players WHERE id = ?",
        [1],
    )
    assert calls[2] == ("SELECT name FROM user_weapons WHERE id = ?", [2])
    assert calls[3] == ("SELECT name FROM user_armors WHERE id = ?", [3])
    assert result["tier"] == "success"
    assert result["rewards"] == {"gold": 2}
