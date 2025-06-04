extends Node
var current_party_selection: Array = []

func start_run():
	print("GameManager.start_run()")
	get_tree().change_scene_to_file("res://scenes/MainMenu.tscn")

func on_preparation_done(party_data: Array) -> void:
	current_party_selection = party_data
	print("GameManager: Received party data:", party_data)
	change_to_dungeon_map()

func change_to_dungeon_map() -> void:
	get_tree().change_scene_to_file("res://scenes/DungeonMap.tscn")
