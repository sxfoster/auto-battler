extends Control

@onready var continue_button = $PreparationManager/ContinueButton

func _ready():
    continue_button.connect("pressed", Callable(self, "_on_continue"))

func _on_continue():
    SceneLoader.goto_scene("DungeonMap")

func gather_selected_party() -> Array:
    var result: Array = []
    for panel in $PreparationManager/PartyMembersContainer.get_children():
        var char_data = panel.character_data
        var assigned = panel.get_assigned_cards()
        result.append({ "character": char_data, "cards": assigned })
    return result
