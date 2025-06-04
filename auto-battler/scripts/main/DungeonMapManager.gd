class_name DungeonMapManager
extends Node

## Manages the procedural dungeon map, node interactions, and transitions to other game states.

# Signals for game state transitions and interactions
signal node_interaction_selected(node_data: Dictionary)
signal transition_to_combat(combat_setup_data: Dictionary)
signal transition_to_loot_event(loot_event_data: Dictionary) # For both loot and generic events
signal transition_to_rest(rest_setup_data: Dictionary)
signal node_selected(node_type: String)

@onready var nodes_container: HBoxContainer = $MapContainer # UI container for map node buttons
# Optional: Preload scenes for popups if they remain part of this manager
const LOOT_PANEL_SCENE := preload("res://scenes/LootPanel.tscn") # Example if used as popup
const EVENT_PANEL_SCENE := preload("res://scenes/EventPanel.tscn") # Example if used as popup

var map_nodes: Array[Dictionary] = [] # Array of dictionaries, each describing a node on the map
var current_node_id: int = 0          # ID of the node the party is currently on
var visited_node_ids: Array[int] = [] # List of visited node IDs

# Example party status - this might be managed by a global GameManager in a real scenario
var current_party_status := {
    "member1": {"hp": 100, "max_hp": 100, "food": 100, "water": 100, "energy": 100},
    "member2": {"hp": 100, "max_hp": 100, "food": 100, "water": 100, "energy": 100},
    "member3": {"hp": 100, "max_hp": 100, "food": 100, "water": 100, "energy": 100},
    "member4": {"hp": 100, "max_hp": 100, "food": 100, "water": 100, "energy": 100},
    "member5": {"hp": 100, "max_hp": 100, "food": 100, "water": 100, "energy": 100}
}

func _ready() -> void:
    for btn in $MapContainer.get_children():
        btn.pressed.connect(_on_Node_pressed.bind(btn.name))


## Generates the procedural map data.
func generate_procedural_map() -> void:
    # Clears existing map data
    map_nodes.clear()
    visited_node_ids.clear()

    var node_count := 5 # Example: fixed number of nodes
    # Node types: combat, loot, event (generic text-based), rest, trap (a type of event)
    var node_types := ["combat", "loot", "event", "rest", "trap"]

    for i in range(node_count):
        var node_type = node_types[randi() % node_types.size()]
        # Ensure the first node is typically combat or a starting event
        if i == 0:
            node_type = "combat"

        var node_data := {
            "id": i,
            "type": node_type,
            "connections": [], # IDs of nodes this node connects to
            "specific_data": {} # Holds data specific to the node type
        }

        # Populate specific_data based on node type
        match node_type:
            "combat":
                node_data.specific_data = get_combat_data_for_node(node_data)
            "loot":
                # For loot nodes, specific_data could define the loot table or specific items
                node_data.specific_data = {"loot_table_id": "generic_dungeon_loot"}
            "event":
                node_data.specific_data = get_event_data_for_node(node_data)
            "trap": # Traps are a subtype of event
                node_data.specific_data = _generate_random_trap_event()
            "rest":
                # Rest nodes might have modifiers, e.g., safety level, cost
                node_data.specific_data = {"safety_level": "average"}

        map_nodes.append(node_data)

    # Create simple linear connections for this example
    # Future: Implement more complex map structures (branching, loops)
    # Future: Pathfinding logic for more complex maps may be needed
    for i in node_count - 1:
        map_nodes[i].connections.append(i + 1)

    current_node_id = 0 # Start at the first node
    visited_node_ids.append(current_node_id)


## Visually represents the map based on map_nodes data.
func display_map() -> void:
    # Clear existing buttons/UI elements for map nodes
    for child in nodes_container.get_children():
        child.queue_free()

    # Create and configure buttons for each map node
    for node_data in map_nodes:
        var btn := Button.new()
        btn.text = node_data.type.capitalize() + " " + str(node_data.id)
        btn.name = "%sNode%d" % [node_data.type.capitalize(), node_data.id]
        btn.set_meta("node_type", node_data.type)
        btn.pressed.connect(_on_Node_pressed.bind(btn.name))
        nodes_container.add_child(btn)
        node_data.button_node = btn # Store reference to the button for easy access

    _update_node_visuals() # Update highlights/disabled states


## Updates the visual state of node buttons (e.g., highlights, disabled).
func _update_node_visuals() -> void:
    if map_nodes.is_empty(): return

    var current_node_data = null
    for node_d in map_nodes:
        if node_d.id == current_node_id:
            current_node_data = node_d
            break

    if not current_node_data:
        printerr("Current node data not found for ID: ", current_node_id)
        return

    for node_data in map_nodes:
        var button = node_data.button_node as Button
        if not button: continue

        if node_data.id == current_node_id:
            button.disabled = true # Current node is disabled for interaction
            button.modulate = Color(0.7, 0.9, 1.0) # Highlight for current node
        elif node_data.id in current_node_data.connections and node_data.id not in visited_node_ids:
            button.disabled = false # Available, unvisited connected node
            button.modulate = Color(1, 1, 1)
        else:
            button.disabled = true # Either not connected or already visited
            button.modulate = Color(0.5, 0.5, 0.5) # Dim for unavailable/visited


## Called when a map node button is pressed.
func on_node_button_pressed(node_id: int) -> void:
    var selected_node_data = null
    for node_d in map_nodes:
        if node_d.id == node_id:
            selected_node_data = node_d
            break

    if selected_node_data:
        # Check if the selected node is a valid move
        var current_node_data = null
        for node_d_curr in map_nodes:
            if node_d_curr.id == current_node_id:
                current_node_data = node_d_curr
                break

        if current_node_data and node_id in current_node_data.connections and node_id not in visited_node_ids:
            emit_signal("node_interaction_selected", selected_node_data)
            emit_signal("node_selected", selected_node_data.type)
            if Engine.has_singleton("GameManager"):
                var gm = Engine.get_singleton("GameManager")
                if gm.has_method("on_map_node_selected"):
                    gm.on_map_node_selected(selected_node_data.type)
        else:
            print("Invalid node selection or already visited: ", node_id)
    else:
        printerr("Node data not found for ID: ", node_id)

## Unified handler for node button presses. Determines node type and informs GameManager.
func _on_Node_pressed(name: String) -> void:
    var node_type = "loot"
    if name.begins_with("Combat"):
        node_type = "combat"
    elif name.begins_with("Rest"):
        node_type = "rest"
    print("Node selected:", node_type)
    emit_signal("node_selected", node_type)

## Handles the interaction logic based on the selected node's data.
func handle_node_interaction(node_data: Dictionary) -> void:
    print("Handling interaction for node: ", node_data.id, " type: ", node_data.type)
    update_player_position(node_data.id) # Move player to the new node

    match node_data.type:
        "combat":
            var combat_data = node_data.specific_data
            # Add party state to combat_data if needed by CombatScene
            # combat_data.party_status = current_party_status
            emit_signal("transition_to_combat", combat_data)
        "loot":
            # If loot panels are popups within DungeonMap:
            # _show_loot_panel(node_data.specific_data)
            # Otherwise, emit signal for GameManager to handle scene/UI transition
            emit_signal("transition_to_loot_event", {"type": "loot", "data": node_data.specific_data})
        "event", "trap": # Traps are handled as events
             # If event panels are popups within DungeonMap:
            # _show_event_panel(node_data.specific_data)
            # Otherwise, emit signal
            emit_signal("transition_to_loot_event", {"type": "event", "data": node_data.specific_data})
        "rest":
            var rest_data = node_data.specific_data
            # Add party state to rest_data if needed
            # rest_data.party_status = current_party_status
            emit_signal("transition_to_rest", rest_data)
        _:
            printerr("Unknown node type encountered: ", node_data.type)
            _update_node_visuals() # Ensure map visuals are refreshed even on unknown type

## Updates the player's current position on the map.
func update_player_position(node_id: int) -> void:
    current_node_id = node_id
    if node_id not in visited_node_ids:
        visited_node_ids.append(node_id)

    # Visual feedback for player movement (e.g., animation, sound) can be triggered here.
    print("Player moved to node: ", node_id)

    display_map() # Re-call display_map to update button states, or just _update_node_visuals
                  # Using display_map() is simpler for now, though _update_node_visuals() is more performant.


## Helper to extract/generate enemy info for a combat node.
func get_combat_data_for_node(node_data: Dictionary) -> Dictionary:
    # Placeholder: Define enemy encounter based on node_data or dungeon level
    # This would typically involve looking up enemy types, numbers, and stats
    var enemy_types = ["goblin_grunt", "goblin_archer", "orc_berserker"]
    var encounter_enemies = []
    var num_enemies = randi_range(1, 3)
    for _i in num_enemies:
        encounter_enemies.append(enemy_types[randi() % enemy_types.size()])

    return {
        "enemies": encounter_enemies,
        "environment": "standard_dungeon_room", # Example environment detail
        "difficulty_rating": randi_range(1,5) # Example
    }

## Helper to get specific event data for an event node.
func get_event_data_for_node(node_data: Dictionary) -> Dictionary:
    # Placeholder: Define event details
    var events = [
        {
            "event_id": "shrine_01",
            "description": "A mysterious shrine radiates a faint energy. Do you attempt to decipher the ancient runes?",
            "options": [
                {"text": "Decipher Runes (Perception DC 12)", "action": "skill_check", "skill": "perception", "dc": 12},
                {"text": "Leave it alone", "action": "ignore"}
            ],
            "outcomes": {
                "skill_check_success": {"text": "You gain a burst of insight and feel slightly rejuvenated!", "effects": {"heal_party_small": true}},
                "skill_check_failure": {"text": "The runes shift menacingly, and a wave of fatigue washes over you.", "effects": {"fatigue_party_small": true}},
                "ignore": {"text": "You decide not to meddle with unknown powers."}
            }
        },
        {
            "event_id": "merchant_01",
            "description": "A weary merchant hails you, offering a small selection of goods.",
            "options": [{"text": "Browse wares", "action": "open_shop"}, {"text": "Ignore", "action": "ignore"}],
            # Shop data would be handled by a different system or defined here
        }
    ]
    return events[randi() % events.size()]

## Generates data for a random trap event.
func _generate_random_trap_event() -> Dictionary:
    var traps = [
        {
            "event_id": "trap_spikes_01",
            "description": "As you step forward, hidden spikes spring up from the floor!",
            "options": [{"text": "Attempt to dodge (Agility DC 10)", "action": "skill_check", "skill": "agility", "dc": 10}],
            "outcomes": {
                "skill_check_success": {"text": "You nimbly avoid the spikes!", "effects": {}},
                "skill_check_failure": {"text": "The spikes catch you off guard!", "effects": {"damage_party_small": true, "amount": 5}}
            }
        },
        {
            "event_id": "trap_darts_01",
            "description": "Poisoned darts shoot out from tiny holes in the walls!",
            "options": [{"text": "Try to block or parry (Defense DC 11)", "action": "skill_check", "skill": "defense", "dc": 11}],
             "outcomes": {
                "skill_check_success": {"text": "You manage to deflect the darts!", "effects": {}},
                "skill_check_failure": {"text": "A few darts find their mark, searing with poison!", "effects": {"damage_party_small": true, "amount": 3, "status": "poisoned"}}
            }
        }
    ]
    return traps[randi() % traps.size()]

# --- Popup Panel Handling (Optional: Keep if panels are simple popups within this scene) ---
# If these become complex or separate scenes, GameManager should handle them post-transition.

func _show_loot_panel(loot_data: Dictionary) -> void:
    var panel := LOOT_PANEL_SCENE.instantiate()
    add_child(panel)
    # Assuming LootPanel has a method to display loot based on loot_data
    # panel.display_loot(loot_data)
    panel.show_loot([{"name": "Gold", "type": "currency", "rarity": 0, "tags": []}]) # Temp
    panel.loot_panel_closed.connect(_on_popup_panel_closed)

func _show_event_panel(event_data: Dictionary) -> void:
    var panel := EVENT_PANEL_SCENE.instantiate()
    add_child(panel)
    panel.show_event(event_data) # Assuming EventPanel uses this structure
    panel.event_resolved.connect(_on_event_panel_resolved.bind(event_data))

func _on_popup_panel_closed() -> void:
    # Called when a loot or simple event popup is closed.
    _update_node_visuals() # Refresh map state

func _on_event_panel_resolved(resolved_outcome_data: Dictionary, original_event_data: Dictionary) -> void:
    # Handle consequences of the event if managed by popups here
    # Example: Apply damage or status effects from resolved_outcome_data
    if resolved_outcome_data.has("effects"):
        var effects = resolved_outcome_data.effects
        if effects.has("damage_party_small"):
            var damage_amount = effects.get("amount", 5) # Default damage if not specified
            for i in range(1, 6): # Assuming 5 members max
                var key := "member" + str(i)
                if current_party_status.has(key):
                    current_party_status[key].hp = max(current_party_status[key].hp - damage_amount, 0)
        # Add more effect handling here (status effects, item changes, etc.)
    update_party_status_display()
    _update_node_visuals()


# --- Party Status Display (Example, might be handled by a dedicated UI scene/script) ---
func update_party_status_display() -> void:
    # This is placeholder logic. In a real game, party status might be a separate, more complex UI element.
    # It would likely be managed by GameManager or a dedicated PartyUIManager.
    for i in range(1, 6):
        var member_key := "member" + str(i)
        # Assuming labels are named like PartyStatusOverlay/Member1Status, etc.
        # This path might need adjustment based on your actual scene structure for party display.
        var label_path := "PartyStatusOverlay/Member" + str(i) + "Status"
        var status_label := get_node_or_null(label_path) as Label

        if status_label and current_party_status.has(member_key):
            var stats = current_party_status[member_key]
            status_label.text = "Member %d: HP %d/%d, F:%d, W:%d, E:%d" % [
                i, stats.hp, stats.max_hp, stats.food, stats.water, stats.energy]
        elif not status_label and get_parent(): # Only print error if part of a scene tree
            #print_debug("DungeonMapManager: Status label not found for " + label_path)
            pass


# --- Helper functions to update party stats (Example, likely from GameManager) ---
func set_party_member_hp(member_id_from_1: int, hp_value: int) -> void:
    var key := "member" + str(member_id_from_1)
    if current_party_status.has(key):
        current_party_status[key].hp = hp_value
        update_party_status_display()

func set_party_member_survival_stat(member_id_from_1: int, stat_name: String, value: int) -> void:
    var key := "member" + str(member_id_from_1)
    if current_party_status.has(key) and current_party_status[key].has(stat_name):
        current_party_status[key][stat_name] = value
        update_party_status_display()

# Note: _generate_random_event() and _generate_random_trap() were refactored into
# get_event_data_for_node() and _generate_random_trap_event() respectively,
# with more structured data.

