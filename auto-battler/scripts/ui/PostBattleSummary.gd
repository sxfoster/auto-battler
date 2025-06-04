extends Control

# UI for displaying XP gained and loot after combat.
# Emits a signal when the player chooses to continue.
signal continue_pressed

@export var summary_label_path: NodePath = NodePath("VBox/SummaryLabel")
@export var continue_button_path: NodePath = NodePath("VBox/ContinueButton")

@onready var summary_label: Label = get_node(summary_label_path)
@onready var continue_button: Button = get_node(continue_button_path)

func _ready() -> void:
    # Connect button using Godot 4 callable style
    continue_button.pressed.connect(_on_continue_button_pressed)

func show_summary(rewards: Dictionary) -> void:
    var xp: int = rewards.get("xp_gained", 0)
    var loot: Array = rewards.get("loot_received", [])
    var loot_names: Array = []
    for item in loot:
        if typeof(item) == TYPE_STRING:
            loot_names.append(item)
        elif item is Resource:
            loot_names.append(item.resource_name)
        else:
            loot_names.append(str(item))
    var loot_text := ", ".join(loot_names)
    summary_label.text = "XP Gained: %d\nLoot: %s" % [xp, loot_text]

func _on_continue_button_pressed() -> void:
    emit_signal("continue_pressed")

func _on_ContinueButton_pressed() -> void:
    GameManager.on_post_battle_continue()
