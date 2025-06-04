extends Control

# Emitted when the "Enter Dungeon" button is pressed.
signal enter_dungeon_pressed
signal enter_dungeon

@export var party_panel_path: NodePath = NodePath("PartyPanel")
@export var card_panel_path: NodePath = NodePath("CardSelectPanel")
@export var gear_panel_path: NodePath = NodePath("GearSelectPanel")
@export var ready_button_path: NodePath = NodePath("ReadyButton")
@export var enter_dungeon_button_path: NodePath = NodePath("EnterDungeonButton")

## Stores the party composition chosen in the preparation screen.
## Each entry should contain the member data along with assigned cards.
@export var party_selection: Array = []

@onready var party_panel: Node = get_node(party_panel_path)
@onready var card_panel: Node = get_node(card_panel_path)
@onready var gear_panel: Node = get_node(gear_panel_path)
@onready var ready_button: Button = get_node(ready_button_path)
@onready var enter_dungeon_button: Button = get_node(enter_dungeon_button_path)

func _ready() -> void:
    # Connect the "Enter Dungeon" button to its handler when the scene is ready.
    if is_instance_valid(enter_dungeon_button):
        # Use Godot 4 callable connection style
        enter_dungeon_button.pressed.connect(_on_EnterDungeonButton_pressed)

func _on_ready_button_pressed() -> void:
    emit_signal("enter_dungeon_pressed")
    emit_signal("enter_dungeon")

func gather_selected_party() -> Array:
    var party: Array = []
    for panel in party_panel.get_children():
        var char_data: CharacterData = panel.character_data
        var assigned_cards: Array = []
        if panel.has_method("get_assigned_cards"):
            assigned_cards = panel.get_assigned_cards()
        party.append({"character": char_data, "cards": assigned_cards})
    return party
