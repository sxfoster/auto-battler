extends Control

const PARTY_SETUP_SCENE := "res://scenes/PartySetup.tscn"
const DUNGEON_MAP_SCENE := "res://scenes/DungeonMap.tscn"
const SETTINGS_SCENE := "res://scenes/SettingsScene.tscn"

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
        get_tree().change_scene_to_file(PARTY_SETUP_SCENE)

func _on_ContinueButton_pressed():
        get_tree().change_scene_to_file(DUNGEON_MAP_SCENE)

func _on_SettingsButton_pressed():
        get_tree().change_scene_to_file(SETTINGS_SCENE)

func _on_ExitButton_pressed():
	get_tree().quit()
