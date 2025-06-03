# CombatManager.gd
# Skeleton for automated combat resolution.

class_name CombatManagerSkeleton
extends Node

## Signals emitted when combat ends.
signal combat_victory(results: Dictionary)
signal combat_defeat(results: Dictionary)

func _ready() -> void:
    # Setup any combat UI or data structures here.
    pass

func initialize_combat(party_data: Array, enemy_data: Array) -> void:
    # GameManager provides combatants for both sides.
    pass

func start_combat() -> void:
    # Begin the turn loop or auto-battle sequence.
    pass

func _end_combat(victory: bool) -> void:
    # Called internally when combat is finished.
    # Emit the appropriate signal so GameManager can change scenes.
    var results := {}
    if victory:
        emit_signal("combat_victory", results)
    else:
        emit_signal("combat_defeat", results)
    # Handoff results to PostBattleManager happens through GameManager.
