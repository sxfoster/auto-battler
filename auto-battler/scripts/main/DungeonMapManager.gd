extends Control
class_name DungeonMapManager

## Manages the procedural dungeon map and scene transitions.

@onready var nodes_container: HBoxContainer = $MapNodesContainer
const LOOT_PANEL_SCENE := preload("res://scenes/LootPanel.tscn")

var map_nodes: Array = []            ## Array of dictionaries describing nodes
var current_node_index: int = 0      ## Index of the node the party is currently on
var visited: Array = []              ## List of visited node indices

var current_party_status := {
    "member1": {"hp": 100, "max_hp": 100, "food": 100, "water": 100, "energy": 100},
    "member2": {"hp": 100, "max_hp": 100, "food": 100, "water": 100, "energy": 100},
    "member3": {"hp": 100, "max_hp": 100, "food": 100, "water": 100, "energy": 100},
    "member4": {"hp": 100, "max_hp": 100, "food": 100, "water": 100, "energy": 100},
    "member5": {"hp": 100, "max_hp": 100, "food": 100, "water": 100, "energy": 100}
}

func _ready() -> void:
    randomize()
    _generate_map()
    _create_buttons()
    update_party_status_display()
    _highlight_available_nodes()

## Procedurally create a simple chain of nodes with random types.
func _generate_map() -> void:
    map_nodes.clear()
    var node_count := 5
    var node_types := ["combat", "loot", "event", "rest"]
    for i in node_count:
        var t := node_types[randi() % node_types.size()]
        if i == 0:
            t = "combat"            # always start with combat
        map_nodes.append({"id": i, "type": t, "connections": []})
    for i in node_count - 1:
        map_nodes[i].connections.append(i + 1)
    current_node_index = 0
    visited = [0]

## Build buttons for each map node.
func _create_buttons() -> void:
    for child in nodes_container.get_children():
        child.queue_free()
    for node in map_nodes:
        var btn := Button.new()
        btn.text = node.type.capitalize()
        btn.pressed.connect(_on_node_pressed.bind(node.id))
        nodes_container.add_child(btn)
        node.button = btn

## Disable or enable buttons based on the current node.
func _highlight_available_nodes() -> void:
    var current := map_nodes[current_node_index]
    for node in map_nodes:
        if node.id == current_node_index:
            node.button.disabled = true
            node.button.modulate = Color(0.7, 0.9, 1.0)
        elif node.id in current.connections and node.id not in visited:
            node.button.disabled = false
            node.button.modulate = Color(1, 1, 1)
        else:
            node.button.disabled = true
            node.button.modulate = Color(0.5, 0.5, 0.5)

func _on_node_pressed(node_id: int) -> void:
    var current := map_nodes[current_node_index]
    if node_id not in current.connections:
        return
    visited.append(node_id)
    current_node_index = node_id
    _handle_node(map_nodes[node_id])

## Transition or show panels based on node type.
func _handle_node(node: Dictionary) -> void:
    match node.type:
        "combat":
            get_tree().change_scene_to_file("res://scenes/CombatScene.tscn")
        "rest":
            get_tree().change_scene_to_file("res://scenes/RestScene.tscn")
        "loot", "event":
            _show_loot_panel()
    _highlight_available_nodes()

func _show_loot_panel() -> void:
    var panel := LOOT_PANEL_SCENE.instantiate()
    add_child(panel)
    panel.show_loot([
        {"name": "Gold", "type": "currency", "rarity": 0, "tags": []}
    ])
    panel.loot_panel_closed.connect(_on_loot_panel_closed)

func _on_loot_panel_closed() -> void:
    _highlight_available_nodes()

## Party status display copied from the previous placeholder script.
func update_party_status_display() -> void:
    for i in range(1, 6):
        var member_key := "member" + str(i)
        var label_path := "PartyStatusOverlay/Member" + str(i) + "Status"
        var status_label := get_node_or_null(label_path)
        if status_label and current_party_status.has(member_key):
            var stats := current_party_status[member_key]
            status_label.text = "Member %d: HP %d/%d, F:%d, W:%d, E:%d" % [
                i, stats.hp, stats.max_hp, stats.food, stats.water, stats.energy]
        elif !status_label:
            print("Error: Status label not found for " + label_path)

# Helper functions to update stats from other systems.
func set_party_member_hp(index_from_1: int, hp: int) -> void:
    var key := "member" + str(index_from_1)
    if current_party_status.has(key):
        current_party_status[key].hp = hp
        update_party_status_display()

func set_party_member_survival_stat(index_from_1: int, stat_name: String, value: int) -> void:
    var key := "member" + str(index_from_1)
    if current_party_status.has(key) and current_party_status[key].has(stat_name):
        current_party_status[key][stat_name] = value
        update_party_status_display()
