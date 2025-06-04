# PostBattleManager.gd
# Skeleton for applying rewards and penalties after combat.

class_name PostBattleManagerSkeleton
extends Node

## Signals to inform GameManager of completion and suggested transitions.
signal post_battle_complete(final_party_state: Array, rewards: Dictionary)
signal transition_to_map
signal transition_to_rest
signal transition_to_game_over

func _ready() -> void:
    # Called when added to the scene tree.
    pass

func process_post_battle(_combat_results: Dictionary, _party_state: Array) -> void:
    # Apply survival penalties, distribute XP and loot here.
    pass

func _finish_processing(victory: bool) -> void:
    # Emit completion signal with updated party data.
    var final_state := []
    var rewards := {}
    emit_signal("post_battle_complete", final_state, rewards)
    # Decide which phase should come next and emit one of the transition signals.
    if victory:
        emit_signal("transition_to_map")
    else:
        emit_signal("transition_to_game_over")
