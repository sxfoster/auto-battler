# SceneLoader.gd
extends Node

const SCENES = {
	"MainMenu": "res://scenes/MainMenu.tscn",
	"PartySetup": "res://scenes/PartySetup.tscn",
	"PreparationScene": "res://scenes/PreparationScene.tscn",
	"DungeonMap": "res://scenes/DungeonMap.tscn"
}


# Helper function to change scenes
func goto_scene(scene_key: String) -> void:
	if SCENES.has(scene_key):
		get_tree().change_scene_to_file(SCENES[scene_key])
	else:
		push_error("Scene key '%s' not found!" % scene_key)
