extends Control

signal map_node_selected(node_id)

# Exported paths to important UI containers
@export var map_nodes_container_path: NodePath = NodePath("MapNodesContainer")
@export var party_status_overlay_path: NodePath = NodePath("PartyStatusOverlay")

var map_nodes: Array = [] # Array describing generated map nodes
var current_party_status: Dictionary = {} # Tracks party status values

@onready var _map_nodes_container: HBoxContainer = get_node(map_nodes_container_path)
@onready var _party_status_overlay: VBoxContainer = get_node(party_status_overlay_path)

func _ready():
	# Placeholder map generation. Real data should come from a manager.
	map_nodes = [
		{"id": 0, "type": "room", "name": "Starting Room"},
		{"id": 1, "type": "event", "name": "Mysterious Shrine"},
		{"id": 2, "type": "room", "name": "Goblin Cave"}
	]

	# Initialize party status (placeholder)
	current_party_status = {
		"member1": {"hp": 100, "max_hp": 100, "food": 100, "water": 100, "energy":100},
		"member2": {"hp": 100, "max_hp": 100, "food": 100, "water": 100, "energy":100},
		"member3": {"hp": 100, "max_hp": 100, "food": 100, "water": 100, "energy":100},
		"member4": {"hp": 100, "max_hp": 100, "food": 100, "water": 100, "energy":100},
		"member5": {"hp": 100, "max_hp": 100, "food": 100, "water": 100, "energy":100}
	}
	update_party_status_display()
	update_map_node_display()

func update_map_node_display():
	# This function would dynamically create/update buttons based on map_nodes
	# For now, the buttons are static in the .tscn
	var map_nodes_container = get_node_or_null("MapNodesContainer")
	if !map_nodes_container:
		print("Error: MapNodesContainer not found")
		return

	var node_buttons = map_nodes_container.get_children()
	for i in range(min(node_buttons.size(), map_nodes.size())):
		if node_buttons[i] is Button:
			node_buttons[i].text = map_nodes[i].name
			# Potentially disable buttons for already visited or unreachable nodes

func _on_map_node_selected(node_index):
	if node_index >= 0 and node_index < map_nodes.size():
		var selected_node = map_nodes[node_index]
		emit_signal("map_node_selected", selected_node.id)
		print("Map node selected: ", selected_node.name)
	else:
		print("Invalid node index: ", node_index)


func update_party_status_display():
	for i in range(1, 6):
		var member_key = "member" + str(i)
		var status_label_path = "PartyStatusOverlay/Member" + str(i) + "Status"
		var status_label = get_node_or_null(status_label_path)

		if status_label and current_party_status.has(member_key):
			var stats = current_party_status[member_key]
			status_label.text = "Member %d: HP %d/%d, F:%d, W:%d, E:%d" % [i, stats.hp, stats.max_hp, stats.food, stats.water, stats.energy]
		elif !status_label:
			print("Error: Status label not found for " + status_label_path)


# Functions to be called by other game systems to update status
func set_party_member_hp(member_index_from_1, hp):
	var member_key = "member" + str(member_index_from_1)
	if current_party_status.has(member_key):
		current_party_status[member_key].hp = hp
		update_party_status_display()
	else:
		print("Error: Member key not found for HP update: " + member_key)

func set_party_member_survival_stat(member_index_from_1, stat_name, value):
	var member_key = "member" + str(member_index_from_1)
	if current_party_status.has(member_key):
		if current_party_status[member_key].has(stat_name):
			current_party_status[member_key][stat_name] = value
			update_party_status_display()
		else:
			print("Error: Stat name not found for member: " + stat_name)
	else:
		print("Error: Member key not found for survival stat update: " + member_key)
