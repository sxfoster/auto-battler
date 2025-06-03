extends Control

signal continue_pressed

func _ready():
    $ContinueButton.pressed.connect(_on_continue_pressed)

func _on_continue_pressed():
    emit_signal("continue_pressed")
