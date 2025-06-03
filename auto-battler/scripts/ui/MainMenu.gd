extends Control

# Signals emitted for other systems to react to menu actions
signal start_game
signal continue_game
signal settings_requested
signal exit_game

# Exported paths for key UI elements so they can be reassigned in the editor if
# the layout changes.
@export var start_button_path: NodePath = NodePath("VBox/StartButton")
@export var continue_button_path: NodePath = NodePath("VBox/ContinueButton")
@export var settings_button_path: NodePath = NodePath("VBox/SettingsButton")
@export var exit_button_path: NodePath = NodePath("VBox/ExitButton")

@onready var _start_button: Button = get_node(start_button_path)
@onready var _continue_button: Button = get_node(continue_button_path)
@onready var _settings_button: Button = get_node(settings_button_path)
@onready var _exit_button: Button = get_node(exit_button_path)

func _ready() -> void:
    # Placeholder for any setup logic. Buttons are connected in the scene file.
    pass

func _on_start_button_pressed() -> void:
    print("Start Game button pressed")
    emit_signal("start_game")
    # GameManager or another controller should handle the actual scene change.

func _on_continue_button_pressed() -> void:
    print("Continue button pressed")
    emit_signal("continue_game")

func _on_settings_button_pressed() -> void:
    print("Settings button pressed")
    emit_signal("settings_requested")

func _on_credits_button_pressed() -> void:
    print("Credits button pressed")
    # Could emit a signal if a dedicated credits scene is used

func _on_exit_button_pressed() -> void:
    print("Exit button pressed")
    emit_signal("exit_game")
    # Default behaviour quits the application
    get_tree().quit()
