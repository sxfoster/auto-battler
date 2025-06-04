extends Node

func _ready() -> void:
    print("Bootstrap loaded")
    GameManager.start_run()
