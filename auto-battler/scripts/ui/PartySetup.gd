extends Control

signal ready_pressed

func _ready():
    $VBoxContainer/ReadyButton.pressed.connect(_on_ready_button)

func _on_ready_button():
    emit_signal("ready_pressed")
