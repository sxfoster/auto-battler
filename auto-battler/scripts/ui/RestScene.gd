# Scene controlling the rest phase UI
extends Control

# Signal emitted when the player chooses to continue
signal rest_completed

# Exported paths to key UI nodes
@export var party_status_grid_path: NodePath = NodePath("VBox/PartyStatusGrid")
@export var rest_progress_label_path: NodePath = NodePath("VBox/RestProgressLabel")
@export var continue_button_path: NodePath = NodePath("VBox/ContinueButton")
@export var use_food_button_path: NodePath = NodePath("VBox/ItemButtons/UseFoodButton")
@export var use_drink_button_path: NodePath = NodePath("VBox/ItemButtons/UseDrinkButton")
@export var craft_button_path: NodePath = NodePath("VBox/ItemButtons/CraftButton")
@export var rest_manager_path: NodePath = NodePath("../RestManager")

@onready var party_status_grid: GridContainer = get_node(party_status_grid_path)
@onready var rest_progress_label: Label = get_node(rest_progress_label_path)
@onready var _continue_button: Button = get_node(continue_button_path)
@onready var _use_food_button: Button = get_node_or_null(use_food_button_path)
@onready var _use_drink_button: Button = get_node_or_null(use_drink_button_path)
@onready var _craft_button: Button = get_node_or_null(craft_button_path)
@onready var _rest_manager: Node = get_node_or_null(rest_manager_path)
# Add @onready vars for food/drink buttons if they are dynamic

# Placeholder for party data. In a real game, this would come from GameManager or PartyManager
var party_members_data = {
	"member1": {"name": "Alice", "hp": 80, "max_hp": 100, "hunger": 50, "max_hunger": 100, "thirst": 60, "max_thirst": 100, "fatigue": 30, "max_fatigue": 100},
	"member2": {"name": "Bob", "hp": 90, "max_hp": 100, "hunger": 70, "max_hunger": 100, "thirst": 40, "max_thirst": 100, "fatigue": 20, "max_fatigue": 100},
	"member3": {"name": "Charlie", "hp": 70, "max_hp": 100, "hunger": 60, "max_hunger": 100, "thirst": 50, "max_thirst": 100, "fatigue": 40, "max_fatigue": 100},
	# Add up to 5 members
}

func _ready():
        update_party_status_display()
        # Hide progress label initially or manage its visibility during a "resting" state
        rest_progress_label.visible = false
        _continue_button.pressed.connect(_on_continue_button_pressed)

func update_party_status_display():
	var member_nodes = party_status_grid.get_children() # These are VBoxContainers
	var member_keys = party_members_data.keys()
	member_keys.sort() # Ensure consistent order if dictionary order changes

	for i in range(member_nodes.size()):
		var member_node_container = member_nodes[i]
		var stat_label = member_node_container.get_node_or_null("Label") # Path to the Label inside VBoxContainer

		if stat_label:
			if i < member_keys.size():
				var member_key = member_keys[i]
				var data = party_members_data[member_key]
				stat_label.text = "%s\nHP: %d/%d\nH: %d/%d\nT: %d/%d\nF: %d/%d" % [
					data.name, data.hp, data.max_hp,
					data.hunger, data.max_hunger,
					data.thirst, data.max_thirst,
					data.fatigue, data.max_fatigue
				]
				member_node_container.visible = true
			else: # If no data for this slot, hide it
				member_node_container.visible = false
		else:
			print("Error: Label node not found in PartyStatusGrid child: ", member_node_container.name)


func _on_use_food_drink_pressed(item_effect_data: Dictionary):
	# This is a simplified example.
	# A real system would target a specific party member (e.g., via another UI element or game logic).
	# For now, let's assume it applies to the first member or a selected member.
	print("Use Food/Drink button pressed: ", item_effect_data)

	# Example: Apply to the first member (if they exist)
	if party_members_data.is_empty():
		print("No party members to apply item to.")
		return

	var first_member_key = party_members_data.keys()[0] # This is not ideal, better to have a selected_member_key
	# In a real game, you'd get the target member from UI selection or game context
	var target_member_key = first_member_key

	var stat_to_change = item_effect_data.get("target_stat", "hunger")
	var value_change = item_effect_data.get("value", 0)
	var max_stat_key = "max_" + stat_to_change

	if party_members_data[target_member_key].has(stat_to_change) and party_members_data[target_member_key].has(max_stat_key):
		party_members_data[target_member_key][stat_to_change] = min(
			party_members_data[target_member_key][stat_to_change] + value_change,
			party_members_data[target_member_key][max_stat_key]
		)
		update_party_status_display()
		# You might want to consume the item from inventory here
		# InventoryManager.consume_item(item_effect_data.name) # Assuming item_effect_data has a unique name/id
		add_rest_log_entry("Applied %s to %s. New %s: %d" % [item_effect_data.get("name", "Item"), party_members_data[target_member_key].name, stat_to_change, party_members_data[target_member_key][stat_to_change]])
	else:
		add_rest_log_entry("Error: Stat '%s' or '%s' not found for %s." % [stat_to_change, max_stat_key, party_members_data[target_member_key].name])


func _on_use_food_button_pressed() -> void:
	var food_effect := {"name": "Ration", "target_stat": "hunger", "value": 20}
	_on_use_food_drink_pressed(food_effect)


func _on_use_drink_button_pressed() -> void:
	var drink_effect := {"name": "Water", "target_stat": "thirst", "value": 20}
	_on_use_food_drink_pressed(drink_effect)


func _on_craft_button_pressed() -> void:
	print("Crafting button pressed")
	if _rest_manager and _rest_manager.has_method("_on_crafting_invoked"):
		_rest_manager._on_crafting_invoked()


func add_rest_log_entry(log_text: String):
	# Simulate showing a log entry, perhaps by making the progress label show it briefly
	print("Rest Log: ", log_text)
	rest_progress_label.text = log_text
	rest_progress_label.visible = true
	var timer = get_tree().create_timer(2.0) # Show log for 2 seconds
	await timer.timeout
	rest_progress_label.visible = false


func _on_continue_button_pressed():
        print("Continue button pressed from Rest Scene")
        # Perform any final rest calculations (e.g., small passive recovery for all members)
        # Example: Small fatigue recovery for everyone
	for member_key in party_members_data:
		if party_members_data[member_key].has("fatigue") and party_members_data[member_key].has("max_fatigue"):
			party_members_data[member_key].fatigue = max(0, party_members_data[member_key].fatigue - 10) # Recover 10 fatigue

	update_party_status_display() # Update display after final changes
	add_rest_log_entry("Journey continues. Party is somewhat rested.")

	await get_tree().create_timer(1.0).timeout # Brief pause to show final log

	emit_signal("rest_completed")
	if _rest_manager and _rest_manager.has_method("on_rest_continue"):
		_rest_manager.on_rest_continue()
	GameManager.on_rest_continue() # Check if GameManager is globally accessible or needs get_node
        # Transition to the next scene (e.g., DungeonMap or a post-rest summary)
        # Example: get_tree().change_scene_to_file("res://scenes/DungeonMap.tscn")


# Call this function if party data changes from an external source
func set_party_data(new_party_data: Dictionary):
	party_members_data = new_party_data.duplicate(true) # Make a deep copy
	update_party_status_display()

# Example of how to add a third member for testing
func _add_test_member_data():
	if !party_members_data.has("member3"):
		party_members_data["member3"] = {"name": "Charlie", "hp": 70, "max_hp": 100, "hunger": 60, "max_hunger": 100, "thirst": 50, "max_thirst": 100, "fatigue": 40, "max_fatigue": 100}
	# You might need to manually ensure PartyStatusGrid has enough VBoxContainer children
	# or dynamically create them if party size can change.
	# For this example, the .tscn file should already have 5 MemberXStats VBoxContainers.
	update_party_status_display()
