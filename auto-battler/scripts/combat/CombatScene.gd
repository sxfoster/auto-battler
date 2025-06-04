extends Control

signal combat_finished

var is_paused = false
var current_speed = 1.0
const SPEED_LEVELS = [1.0, 1.5, 2.0]
var current_speed_index = 0

# Exported node paths for important panels
@export var party_panel_path: NodePath = NodePath("PartyPanel")
@export var enemy_panel_path: NodePath = NodePath("EnemyPanel")
@export var cards_area_path: NodePath = NodePath("CharacterCardsArea")
@export var combat_log_container_path: NodePath = NodePath("CombatLogPanel/CombatLogScroll/CombatLog")
@export var combat_log_scroll_path: NodePath = NodePath("CombatLogPanel/CombatLogScroll")
@export var speed_button_path: NodePath = NodePath("TopBar/SpeedUpButton")
@export var pause_button_path: NodePath = NodePath("TopBar/PauseButton")
@export var feedback_label_path: NodePath = NodePath("FeedbackLabel")

@onready var party_panel: VBoxContainer = get_node(party_panel_path)
@onready var enemy_panel: VBoxContainer = get_node(enemy_panel_path)
@onready var character_cards_area: HBoxContainer = get_node(cards_area_path)
@onready var combat_log_container: VBoxContainer = get_node(combat_log_container_path)
@onready var combat_log_scroll: ScrollContainer = get_node(combat_log_scroll_path)
@onready var speed_up_button: Button = get_node(speed_button_path)
@onready var pause_button: Button = get_node(pause_button_path)
@onready var feedback_label: Label = get_node(feedback_label_path)

# Placeholder data for party and enemies
var party_members_data = []
var enemies_data = []

func _ready():
	# Initialize combat: load party/enemy data, set up UI elements
	add_combat_log_entry("Combat Scene Initialized. Player input disabled during auto-battle.")

	var combat_mgr: AutoCombatManager = get_node("CombatManager")
	combat_mgr.connect("combat_ended", Callable(get_node("/root/GameManager"), "on_combat_ended"))
	if not combat_mgr.combat_victory.is_connected(_on_combat_victory):
		combat_mgr.combat_victory.connect(_on_combat_victory)
	if not combat_mgr.combat_defeat.is_connected(_on_combat_defeat):
		combat_mgr.combat_defeat.connect(_on_combat_defeat)
	combat_mgr.run_auto_battle_loop()

	# Example: Populate with placeholder party member panels
	# for i in range(1, 3): # Assuming 2 party members for this example
	#     var member_label = party_panel.get_node("PartyMember" + str(i) + "/Label")
	#     if member_label:
	#         member_label.text = "Party Member " + str(i) + "\nHP: 100/100\nFatigue: 0"

	# Example: Populate with placeholder enemy panels
	# for i in range(1, 2): # Assuming 1 enemy for this example
	#     var enemy_label = enemy_panel.get_node("Enemy" + str(i) + "/Label")
	#     if enemy_label:
	#         enemy_label.text = "Enemy " + str(i) + "\nHP: 50/50"

	# Disable player input areas (except pause/speed)
	# This might involve disabling input on card nodes or other interactive elements
	# For now, it's mostly a conceptual note as detailed interaction isn't built yet

func _process(delta):
	if is_paused:
		return

	var effective_delta = delta * current_speed
	# Main combat loop logic would go here (AI turns, card resolution, etc.)
	# For now, just a placeholder
	# update_combat_state(effective_delta)
	# update_ui()

func _on_pause_button_pressed():
	is_paused = !is_paused
	if is_paused:
		pause_button.text = "Resume"
		add_combat_log_entry("Combat Paused.")
		Engine.time_scale = 0 # More robust pausing if physics is involved
	else:
		pause_button.text = "Pause"
		add_combat_log_entry("Combat Resumed.")
		Engine.time_scale = 1.0 # Ensure time scale is reset
	print("Pause button pressed. Paused: ", is_paused)

func _on_speed_up_button_pressed():
	current_speed_index = (current_speed_index + 1) % SPEED_LEVELS.size()
	current_speed = SPEED_LEVELS[current_speed_index]
	speed_up_button.text = "Speed Up x" + str(current_speed)
	add_combat_log_entry("Combat speed set to x" + str(current_speed))
	print("Speed up button pressed. Current speed: ", current_speed)

func end_combat() -> void:
	emit_signal("combat_finished")

func _on_combat_victory(results: Dictionary) -> void:
		var gm = get_node_or_null("/root/GameManager")
		if gm:
				if gm.has_method("on_combat_end"):
						gm.on_combat_end(true, results)
				elif gm.has_method("on_combat_victory"):
						gm.on_combat_victory(results)
		end_combat()
		SceneLoader.goto_scene("PostBattleSummary")

func _on_combat_defeat(results: Dictionary) -> void:
		var gm = get_node_or_null("/root/GameManager")
		if gm:
				if gm.has_method("on_combat_end"):
						gm.on_combat_end(false, results)
				elif gm.has_method("on_combat_ended"):
						gm.on_combat_ended(false)
		end_combat()
		SceneLoader.goto_scene("PostBattleSummary")

func add_combat_log_entry(text_entry: String):
	var new_log = Label.new()
	new_log.text = text_entry
	new_log.autowrap_mode = TextServer.AUTOWRAP_WORD
	combat_log_container.add_child(new_log)
	# Optional: Scroll to bottom if the log is in a ScrollContainer
	await get_tree().process_frame # Wait for node to be added
	# Alternative: call_deferred on scroll_bar.value = scroll_bar.max_value
	var scroll_bar = combat_log_scroll.get_v_scroll_bar()
	if scroll_bar:
		scroll_bar.value = scroll_bar.max_value

func show_visual_feedback(text: String, duration: float = 1.0):
	feedback_label.text = text
	feedback_label.visible = true
	var timer = get_tree().create_timer(duration)
	await timer.timeout # Use await with timeout signal
	feedback_label.visible = false

# Placeholder functions for updating UI based on game state
func update_party_display(party_data):
	# Iterate through party_data and update each PartyMemberPanel instance
	pass

func update_enemy_display(enemy_data):
	# Iterate through enemy_data and update each EnemyPanel instance
	pass

func update_character_cards_display(character_cards):
	# Display cards for the current acting character
	# Highlight the card being played
	pass

# Example of how visual feedback might be triggered
func _trigger_example_feedback():
	# Simulate a damage event
	show_visual_feedback("Direct Hit! -20 HP", 1.5)
	add_combat_log_entry("Goblin attacks Player 1 for 20 damage.")
