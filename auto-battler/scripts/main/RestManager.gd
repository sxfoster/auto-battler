# RestManager.gd
# Manages the resting phase of the game.
# Allows players to use consumables, view survival stats,
# and potentially invoke crafting or repair systems.
# Handles transitioning back to exploration or exiting the dungeon.

extends Node
class_name RestManager

# Emitted when the player decides to continue exploring after resting.
signal rest_continue_exploration(updated_party_data: Array)

# Emitted when the player decides to exit the dungeon from the rest phase.
signal rest_exit_dungeon(updated_party_data: Array)

# Simple signal when rest is finished via Continue button
signal rest_complete

# Exported variables for UI node paths (examples)
@export var party_stats_display_node: Control  # Assign in editor: Node to display party stats
@export var consumables_panel_node: Control # Assign in editor: Node for consumable usage
@export var crafting_button_node: Button    # Assign in editor: Button to open crafting
@export var repair_button_node: Button      # Assign in editor: Button to open repair

# Internal state variables
var current_party_data: Array = [] # To store/display party member details
var available_consumables: Array = [] # Consumables the player has access to

func _ready() -> void:
    $ContinueButton.pressed.connect(_on_Continue_pressed)

func _on_Continue_pressed() -> void:
    emit_signal("rest_complete")

# Called by GameManager to initialize the rest phase with current data.
func initialize_rest_phase(party_data: Array, inventory_consumables: Array) -> void:
    current_party_data = party_data
    available_consumables = inventory_consumables
    _display_party_survival_stats()
    _display_consumables()
    # Further UI setup based on the provided data
    print("RestManager: Initialized rest phase.")

# Stub for displaying party members' survival stats (HP, fatigue, hunger, thirst).
func _display_party_survival_stats() -> void:
    # Future implementation:
    # Iterate through current_party_data and update UI elements
    # bound via party_stats_display_node.
    print("RestManager: Displaying party survival stats (stub).")
    for i in range(current_party_data.size()):
        var member = current_party_data[i]
        # Assuming member is a Dictionary with expected keys
        # print("Member %s: HP %s, Fatigue %s" % [member.get("name", "N/A"), member.get("hp", 0), member.get("fatigue", 0)])
    pass

# Stub for displaying available consumables for use.
func _display_consumables() -> void:
    # Future implementation:
    # Populate UI (e.g., consumables_panel_node) with available_consumables.
    # Each consumable item in the UI should allow triggering _on_consumable_used.
    print("RestManager: Displaying available consumables (stub).")
    pass

# Called when a player uses a consumable item on a party member.
func _on_consumable_used(consumable_data: Resource, target_member_index: int) -> void:
    # Future implementation:
    # 1. Validate if the consumable can be used and if the target is valid.
    # 2. Apply the consumable's effects to current_party_data[target_member_index].
    # 3. Update the available_consumables list (e.g., remove one charge).
    # 4. Refresh UI displays (_display_party_survival_stats, _display_consumables).
    # Emits a signal if party data changes in a way other managers need to know,
    # or rely on GameManager to fetch updated state when rest phase ends.
    print("RestManager: Consumable '%s' used on member %s (stub)." % [consumable_data.resource_name if consumable_data else "N/A", target_member_index])
    # Example: current_party_data[target_member_index].hp += 10 # Placeholder effect
    _display_party_survival_stats() # Refresh stats display
    _display_consumables() # Refresh consumable list
    pass

# Called when the player initiates crafting.
func _on_crafting_invoked() -> void:
    # Future implementation:
    # 1. May transition to a dedicated crafting scene/manager.
    # 2. Or, display a crafting UI panel within the rest scene.
    # 3. GameManager might need to be involved for scene transitions or providing crafting system access.
    print("RestManager: Crafting invoked (stub).")
    # Example: get_tree().change_scene_to_file("res://scenes/CraftingScene.tscn") - but prefer signals to GameManager
    pass

# Called when the player initiates repair.
func _on_repair_invoked() -> void:
    # Future implementation:
    # 1. Similar to crafting, might involve a new scene/manager or a UI panel.
    # 2. Logic for selecting items to repair and resource costs.
    print("RestManager: Repair invoked (stub).")
    pass

# Called when the "Continue Exploration" button is pressed in the UI.
func _on_continue_exploration_pressed() -> void:
    # Future implementation:
    # Perform any final checks or save interim state if necessary.
    print("RestManager: Continue exploration pressed.")
    emit_signal("rest_continue_exploration", get_updated_party_data())

func on_rest_continue() -> void:
    print("RestManager: on_rest_continue called")
    _on_continue_exploration_pressed()

# Called when the "Exit Dungeon" button is pressed in the UI.
func _on_exit_dungeon_pressed() -> void:
    # Future implementation:
    # Perform any final actions before exiting (e.g., confirming choice).
    print("RestManager: Exit dungeon pressed.")
    emit_signal("rest_exit_dungeon", get_updated_party_data())

# Helper to get the latest party data after rest actions.
func get_updated_party_data() -> Array:
    # This function would return the current_party_data which might have been modified
    # by using consumables or other rest activities.
    return current_party_data

# --- Example UI Signal Connections (to be done in Godot Editor or via code) ---
# func _connect_ui_signals():
#   var continue_button = find_child("ContinueButton") # Placeholder
#   if continue_button:
#       continue_button.pressed.connect(_on_continue_exploration_pressed)
#
#   var exit_button = find_child("ExitButton") # Placeholder
#   if exit_button:
#       exit_button.pressed.connect(_on_exit_dungeon_pressed)
