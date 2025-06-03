extends Control

signal start_game
signal continue_game
signal open_settings
signal open_credits
signal exit_game

func _ready():
    $CenterContainer/VBoxContainer/StartButton.pressed.connect(_on_start_pressed)
    $CenterContainer/VBoxContainer/ContinueButton.pressed.connect(_on_continue_pressed)
    $CenterContainer/VBoxContainer/ExitButton.pressed.connect(_on_exit_pressed)
    if $CenterContainer/VBoxContainer.has_node("SettingsButton"):
        $CenterContainer/VBoxContainer/SettingsButton.pressed.connect(_on_settings_pressed)
    if $CenterContainer/VBoxContainer.has_node("CreditsButton"):
        $CenterContainer/VBoxContainer/CreditsButton.pressed.connect(_on_credits_pressed)

func _on_start_pressed():
    emit_signal("start_game")

func _on_continue_pressed():
    emit_signal("continue_game")

func _on_settings_pressed():
    emit_signal("open_settings")

func _on_credits_pressed():
    emit_signal("open_credits")

func _on_exit_pressed():
    emit_signal("exit_game")
