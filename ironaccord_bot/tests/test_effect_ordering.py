from ironaccord_bot.utils.effect_ordering import order_effects


def test_order_effects_respects_dependencies():
    effects = [
        {"id": 1, "type": "damage"},
        {"id": 2, "type": "heal"},
        {"id": 3, "type": "buff"},
        {"id": 4, "type": "damage"},
        {"id": 5, "type": "heal"},
    ]
    deps = {"heal": ["damage"], "damage": ["buff"]}
    ordered = order_effects(effects, deps)
    assert [e["id"] for e in ordered] == [3, 1, 4, 2, 5]


def test_order_effects_leaves_unknown_intact():
    effects = [
        {"id": 1, "type": "special"},
        {"id": 2, "type": "damage"},
        {"id": 3, "type": "heal"},
        {"id": 4, "type": "special"},
    ]
    deps = {"heal": ["damage"]}
    ordered = order_effects(effects, deps)
    # Unknown "special" type should keep input order
    assert [e["id"] for e in ordered] == [2, 3, 1, 4]
