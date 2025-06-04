extends Control


const DUNGEON_MAP_SCENE := "res://scenes/DungeonMap.tscn"

@onready var continue_button = $PreparationManager/ContinueButton


func _ready():
    continue_button.pressed.connect(_on_continue_button_pressed)


func _on_continue_button_pressed():
    var party_selection = gather_selected_party()
    print("Party ready:", party_selection)
    get_tree().change_scene_to_file(DUNGEON_MAP_SCENE)

func gather_selected_party() -> Array:
    var result: Array = []
    for panel in $PreparationManager/PartyMembersContainer.get_children():
        var char_data = panel.character_data
        var assigned = panel.get_assigned_cards()
        result.append({ "character": char_data, "cards": assigned })
    return result
