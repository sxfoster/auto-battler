extends Node2D
class_name DungeonMapManager

## Generates a simple node-based dungeon map and handles node selection.

const NODE_TYPES := ["combat", "loot", "event", "rest"]

var nodes := []            ## Array of dictionaries describing each node
var connections := {}      ## id -> Array[int]
var current_node := -1     ## id of the current node

@onready var map_container: Node2D = $MapContainer
@onready var loot_event_panel: Control = $LootEventPanel
@onready var loot_event_label: Label = $LootEventPanel/Label
@onready var close_button: Button = $LootEventPanel/CloseButton

var _rng := RandomNumberGenerator.new()

func _ready() -> void:
    _rng.randomize()
    close_button.connect("pressed", Callable(self, "hide_loot_event_panel"))
    generate_map()

func generate_map() -> void:
    ## Remove existing map nodes
    for c in map_container.get_children():
        c.queue_free()
    nodes.clear()
    connections.clear()

    # Create a simple linear map of 6 nodes
    var start_id := _create_node("start", Vector2.ZERO)
    current_node = start_id
    var prev_id := start_id
    var x := 150.0
    for i in range(5):
        var t := NODE_TYPES[_rng.randi_range(0, NODE_TYPES.size() - 1)]
        var node_id := _create_node(t, Vector2(x, _rng.randi_range(-60, 60)))
        _connect_nodes(prev_id, node_id)
        prev_id = node_id
        x += 150

    _update_available_nodes()

func _create_node(t: String, pos: Vector2) -> int:
    var id := nodes.size()
    var button := Button.new()
    button.text = t.capitalize()
    button.position = pos
    button.disabled = true
    button.connect("pressed", Callable(self, "_on_node_pressed").bind(id))
    map_container.add_child(button)
    nodes.append({"type": t, "button": button, "pos": pos})
    connections[id] = []
    return id

func _connect_nodes(a: int, b: int) -> void:
    connections[a].append(b)
    connections[b].append(a)
    var line := Line2D.new()
    line.width = 2
    line.add_point(nodes[a].pos)
    line.add_point(nodes[b].pos)
    map_container.add_child(line)

func _update_available_nodes() -> void:
    for i in nodes.size():
        var info = nodes[i]
        var btn: Button = info.button
        btn.disabled = true
        btn.modulate = Color.gray
    if current_node >= 0:
        var cur_btn: Button = nodes[current_node].button
        cur_btn.modulate = Color.white
        for n in connections[current_node]:
            var btn: Button = nodes[n].button
            btn.disabled = false
            btn.modulate = Color(1, 1, 1)

func _on_node_pressed(id: int) -> void:
    if current_node < 0 or not connections[current_node].has(id):
        return
    current_node = id
    var node_type: String = nodes[id].type
    match node_type:
        "combat":
            get_tree().change_scene_to_file("res://auto-battler/scenes/CombatScene.tscn")
        "rest":
            get_tree().change_scene_to_file("res://auto-battler/scenes/RestScene.tscn")
        "loot", "event":
            _show_loot_event_panel(node_type)
        _:
            pass
    _update_available_nodes()

func _show_loot_event_panel(t: String) -> void:
    loot_event_label.text = "%s encountered!" % t.capitalize()
    loot_event_panel.visible = true

func hide_loot_event_panel() -> void:
    loot_event_panel.visible = false
