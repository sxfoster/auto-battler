extends Control

func _ready():
    $ContinueButton.pressed.connect(_on_continue)

func _on_continue():
    SceneLoader.goto_scene("DungeonMap")
