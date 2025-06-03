# PreparationManager.gd
# Skeleton for the preparation phase where the party is configured before entering the dungeon.

class_name PreparationManagerSkeleton
extends Node

## Emitted when the player finishes preparations.
signal party_ready_for_dungeon

func _ready() -> void:
    # Called when the node enters the scene tree.
    # Connect UI signals or load initial data here.
    pass

func start_preparation(party_data: Array) -> void:
    # GameManager calls this to provide current party information.
    # Set up internal data structures or UI based on party_data.
    pass

func _on_start_dungeon_pressed() -> void:
    # Called by the UI when the player confirms their party setup.
    # Emit a signal so GameManager can change scenes to the dungeon map.
    emit_signal("party_ready_for_dungeon")
    # Handoff party data to GameManager here if required.
