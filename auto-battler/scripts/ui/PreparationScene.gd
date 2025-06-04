extends Control

@onready var ready_button: Button = $PreparationManager/ReadyButton

func _ready() -> void:
    ready_button.pressed.connect(_on_ReadyButton_pressed)

func _on_ReadyButton_pressed() -> void:
    var party_selection := gather_selected_party()
    print("Party ready:", party_selection)
    GameManager.on_preparation_done(party_selection)

func gather_selected_party() -> Array:
    var result: Array = []
    for panel in $PreparationManager/PartyMembersContainer.get_children():
        var char_data = panel.character_data
        var assigned = panel.get_assigned_cards()
        result.append({ "character": char_data, "cards": assigned })
    return result
