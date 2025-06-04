extends Control

@onready var start_button    = $ContentMargin/MainVBox/ButtonsVBox/StartButton
@onready var continue_button = $ContentMargin/MainVBox/ButtonsVBox/ContinueButton
@onready var settings_button = $ContentMargin/MainVBox/ButtonsVBox/SettingsButton
@onready var exit_button     = $ContentMargin/MainVBox/ButtonsVBox/ExitButton

func _ready():
    start_button.connect("pressed", Callable(self, "_on_StartButton_pressed"))
    continue_button.connect("pressed", Callable(self, "_on_ContinueButton_pressed"))
    settings_button.connect("pressed", Callable(self, "_on_SettingsButton_pressed"))
    exit_button.connect("pressed", Callable(self, "_on_ExitButton_pressed"))

func _on_StartButton_pressed():
    get_tree().change_scene_to_file("res://scenes/PreparationScene.tscn")

func _on_ContinueButton_pressed():
    get_tree().change_scene_to_file("res://scenes/DungeonMap.tscn")

func _on_SettingsButton_pressed():
    get_tree().change_scene_to_file("res://scenes/SettingsScene.tscn")

func _on_ExitButton_pressed():
    get_tree().quit()

