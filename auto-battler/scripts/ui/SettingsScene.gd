extends Control

func _ready():
    $BackButton.connect("pressed", Callable(self, "_on_BackButton_pressed"))

func _on_BackButton_pressed():
    get_tree().change_scene_to_file("res://scenes/MainMenu.tscn")
