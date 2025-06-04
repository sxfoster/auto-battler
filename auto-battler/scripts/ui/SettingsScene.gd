extends Control

func _ready():
    $BackButton.connect("pressed", Callable(self, "_on_BackButton_pressed"))

func _on_BackButton_pressed():
    SceneLoader.goto_scene("MainMenu")
