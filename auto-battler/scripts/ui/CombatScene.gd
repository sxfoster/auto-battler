extends Node2D

signal combat_finished

var combat_speed := 1.0
var paused := false

func _ready():
    if has_node("Controls/SpeedButton"):
        $Controls/SpeedButton.pressed.connect(_on_speed_button)
    if has_node("Controls/PauseButton"):
        $Controls/PauseButton.pressed.connect(_on_pause_button)

func _on_speed_button():
    combat_speed = clamp(combat_speed + 1, 1, 4)

func _on_pause_button():
    paused = !paused
