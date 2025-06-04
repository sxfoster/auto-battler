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
        SceneLoader.goto_scene("PartySetup")

func _on_ContinueButton_pressed():
        SceneLoader.goto_scene("DungeonMap")

func _on_SettingsButton_pressed():
        SceneLoader.goto_scene("SettingsScene")

func _on_ExitButton_pressed():
	get_tree().quit()
