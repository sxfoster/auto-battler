extends Node

signal post_battle_complete

func _ready():
    $MainVBox/ContinueButton.connect("pressed", self, "_on_Continue_pressed")
func _on_Continue_pressed():
    emit_signal("post_battle_complete")
