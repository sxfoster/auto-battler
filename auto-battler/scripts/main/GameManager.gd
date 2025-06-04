extends Node

func start_run():
	print("GameManager.start_run()")
	get_tree().change_scene_to_file("res://scenes/MainMenu.tscn")
