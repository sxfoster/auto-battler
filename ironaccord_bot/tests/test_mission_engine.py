import pytest

from ironaccord_bot.utils import mission_engine

class DummyDB:
    def __init__(self, stats_rows=None, eq_row=None, items=None):
        self.stats_rows = stats_rows or []
        self.eq_row = eq_row or {}
        self.items = items or {}

    async def query(self, sql, params=None):
        if 'FROM user_stats' in sql:
            return {'rows': self.stats_rows}
        if 'FROM players' in sql:
            return {'rows': [self.eq_row] if self.eq_row else []}
        for table in ['user_weapons', 'user_armors', 'user_ability_cards']:
            if table in sql:
                item_id = params[0]
                name = self.items.get(table, {}).get(item_id)
                return {'rows': [{'name': name}]} if name else {'rows': []}
        return {'rows': []}

@pytest.mark.asyncio
async def test_resolve_choice_success(monkeypatch):
    db = DummyDB(
        stats_rows=[{'stat': 'strength', 'value': 2}],
        eq_row={'equipped_weapon_id': 1, 'equipped_armor_id': 1, 'equipped_ability_id': 1},
        items={
            'user_weapons': {1: 'Sword'},
            'user_armors': {1: 'Plate Armor'},
            'user_ability_cards': {1: 'Fireball'},
        }
    )
    monkeypatch.setattr(mission_engine, 'db', db)
    monkeypatch.setattr(mission_engine.random, 'randint', lambda a, b: 10)

    choice = {'stat': 'strength', 'dc': 12, 'rewards': {'xp': 50}}
    result = await mission_engine.resolve_choice(1, choice)
    assert result == {'tier': 'success', 'rewards': {'xp': 50}}


@pytest.mark.asyncio
async def test_resolve_choice_failure(monkeypatch):
    db = DummyDB(
        stats_rows=[{'stat': 'strength', 'value': 1}],
        eq_row={'equipped_weapon_id': 1, 'equipped_armor_id': 1, 'equipped_ability_id': 1},
        items={
            'user_weapons': {1: 'Sword'},
            'user_armors': {1: 'Plate Armor'},
            'user_ability_cards': {1: 'Fireball'},
        }
    )
    monkeypatch.setattr(mission_engine, 'db', db)
    monkeypatch.setattr(mission_engine.random, 'randint', lambda a, b: 4)

    choice = {'stat': 'strength', 'dc': 15, 'penalties': {'hp': -5}}
    result = await mission_engine.resolve_choice(1, choice)
    assert result == {'tier': 'fail', 'penalties': {'hp': -5}}


@pytest.mark.asyncio
async def test_resolve_choice_critical_success(monkeypatch):
    db = DummyDB()
    monkeypatch.setattr(mission_engine, 'db', db)
    monkeypatch.setattr(mission_engine.random, 'randint', lambda a, b: 20)

    choice = {
        'outcomes': {
            'critical_success': {'rewards': {'xp': 200}}
        }
    }
    result = await mission_engine.resolve_choice(1, choice)
    assert result == {'tier': 'critical_success', 'rewards': {'xp': 200}}


@pytest.mark.asyncio
async def test_resolve_choice_critical_fail(monkeypatch):
    db = DummyDB()
    monkeypatch.setattr(mission_engine, 'db', db)
    monkeypatch.setattr(mission_engine.random, 'randint', lambda a, b: 1)

    choice = {
        'outcomes': {
            'critical_fail': {'penalties': {'hp': -10}}
        }
    }
    result = await mission_engine.resolve_choice(1, choice)
    assert result == {'tier': 'critical_fail', 'penalties': {'hp': -10}}
