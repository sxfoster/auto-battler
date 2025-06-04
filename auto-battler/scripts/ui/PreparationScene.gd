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
        enter_dungeon_button.connect("pressed", self, "_on_EnterDungeonButton_pressed")

func _on_ready_button_pressed() -> void:
    emit_signal("enter_dungeon_pressed")
    emit_signal("enter_dungeon")

func gather_selected_party() -> Array:
    # Placeholder implementation. In a full version this would read UI state
    # from party_panel and card_panel to build the party data structure.
    return party_selection.duplicate(true)

func _on_EnterDungeonButton_pressed() -> void:
    var chosen_party := gather_selected_party()
    GameManager.on_preparation_done(chosen_party)
