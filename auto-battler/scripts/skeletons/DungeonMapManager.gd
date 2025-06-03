# DungeonMapManager.gd
# Skeleton for navigating the procedural dungeon map.

# class_name DungeonMapManager
extends Control

## Transition signals for GameManager.
signal transition_to_combat(combat_setup: Dictionary)
signal transition_to_loot_event(event_data: Dictionary)
signal transition_to_rest(rest_data: Dictionary)

func _ready() -> void:
    # Setup map generation or UI elements here.
    pass

func generate_map() -> void:
    # Build nodes and connections for the dungeon map.
    pass

func on_node_selected(node_data: Dictionary) -> void:
    # Determine node type and emit the matching transition signal.
    # Scene or data handoff to GameManager happens via these signals.
    pass
