extends Control

# Emitted when the "Enter Dungeon" button is pressed.
signal enter_dungeon_pressed
signal enter_dungeon

@export var party_panel_path: NodePath = NodePath("PartyPanel")
@export var card_panel_path: NodePath = NodePath("CardSelectPanel")
@export var gear_panel_path: NodePath = NodePath("GearSelectPanel")
@export var ready_button_path: NodePath = NodePath("ReadyButton")

@onready var party_panel: Node = get_node(party_panel_path)
@onready var card_panel: Node = get_node(card_panel_path)
@onready var gear_panel: Node = get_node(gear_panel_path)
@onready var ready_button: Button = get_node(ready_button_path)

func _ready() -> void:
    pass # Placeholder for future initialization

func _on_ready_button_pressed() -> void:
    emit_signal("enter_dungeon_pressed")
    emit_signal("enter_dungeon")
