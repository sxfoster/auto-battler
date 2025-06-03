# RestManager.gd
# Skeleton for handling the rest phase between encounters.

class_name RestManager
extends Node

## Signals for scene transitions.
signal rest_continue_exploration(updated_party_data: Array)
signal rest_exit_dungeon(updated_party_data: Array)

func _ready() -> void:
    # Setup rest screen UI here.
    pass

func initialize_rest(party_data: Array, consumables: Array) -> void:
    # Called by GameManager with the current party state and inventory.
    pass

func _on_continue_pressed() -> void:
    # Player chooses to keep exploring.
    emit_signal("rest_continue_exploration", [])
    # Hand off any modified party data back to GameManager here.

func _on_exit_pressed() -> void:
    # Player chooses to leave the dungeon.
    emit_signal("rest_exit_dungeon", [])
    # Hand off party data to GameManager for wrap-up.
