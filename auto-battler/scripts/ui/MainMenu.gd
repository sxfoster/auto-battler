extends Control

# Called when the node enters the scene tree for the first time.
func _ready():
	pass # Replace with function body.


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	pass

func _on_start_button_pressed():
	print("Start Game button pressed")
	# Replace with game start logic, e.g., get_tree().change_scene_to_file("res://scenes/PartySetup.tscn")

func _on_continue_button_pressed():
	print("Continue button pressed")
	# Replace with continue game logic, e.g., load game state

func _on_settings_button_pressed():
	print("Settings button pressed")
	# Replace with settings screen logic

func _on_credits_button_pressed():
	print("Credits button pressed")
	# Replace with credits screen logic

func _on_exit_button_pressed():
	print("Exit button pressed")
	get_tree().quit()
