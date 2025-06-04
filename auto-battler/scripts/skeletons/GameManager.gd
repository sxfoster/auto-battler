# GameManager.gd
# Skeleton orchestrating the overall game flow and scene transitions.

class_name GameManagerSkeleton
extends Node

## Signal emitted whenever the high level phase changes.
signal game_phase_changed(new_phase: String)


func _ready() -> void:
	# Connect signals from other managers here.
	pass


func start_new_game() -> void:
	# Initialize party data and load the preparation scene.
	pass


func _on_party_ready_for_dungeon() -> void:
	# Received from PreparationManager; switch to the dungeon map scene.
	emit_signal("game_phase_changed", "dungeon_map")
	# Scene change via get_tree().change_scene_to_file() happens here.


func _on_enter_combat(_combat_data: Dictionary) -> void:
	# Received from DungeonMapManager when a combat node is chosen.
	emit_signal("game_phase_changed", "combat")
	# Pass combat_data to CombatManager and change scenes.


func _on_rest_complete(_updated_party: Array) -> void:
	# Received from RestManager after resting.
	emit_signal("game_phase_changed", "dungeon_map")
	# Update stored party data and return to map.
