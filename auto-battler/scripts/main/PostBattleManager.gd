extends Node

signal post_battle_complete

func _ready():
    $VBox/ContinueButton.pressed.connect(_on_Continue_pressed)
func _on_Continue_pressed():
    emit_signal("post_battle_complete")
