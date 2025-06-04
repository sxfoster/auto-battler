extends Node

# This singleton drives the phase transitions: Preparation → Map → Combat → Post-Battle → Rest → Map…

func _ready():
    print("GameManager ready")

func start_run():
    print("GameManager.start_run()")
    change_to_preparation()

func change_to_preparation():
    get_tree().change_scene_to_file("res://scenes/PreparationScene.tscn")
    await get_tree().process_frame
    var prep_mgr = get_tree().current_scene.get_node("PreparationManager")
    prep_mgr.connect("preparation_done", Callable(self, "on_preparation_done"))

func on_preparation_done(party_data):
    # party_data is an Array of dictionaries { "character": CharacterData, "cards": [CardData] }
    print("on_preparation_done:", party_data)
    change_to_dungeon_map()

func change_to_dungeon_map():
    get_tree().change_scene_to_file("res://scenes/DungeonMap.tscn")
    await get_tree().process_frame
    var map_mgr = get_tree().current_scene.get_node("DungeonMapManager")
    map_mgr.connect("node_selected", Callable(self, "on_node_selected"))

func on_node_selected(node_type:String):
    print("on_node_selected:", node_type)
    match node_type:
        "combat":
            change_to_combat()
        "rest":
            change_to_rest()
        _:
            change_to_loot()

func change_to_combat():
    get_tree().change_scene_to_file("res://scenes/CombatScene.tscn")
    await get_tree().process_frame
    var combat_mgr = get_tree().current_scene.get_node("CombatManager")
    combat_mgr.connect("combat_ended", Callable(self, "on_combat_ended"))

func on_combat_ended(victory:bool):
    print("on_combat_ended:", victory)
    if victory:
        change_to_post_battle()
    else:
        get_tree().change_scene_to_file("res://scenes/GameOver.tscn")

func change_to_post_battle():
    get_tree().change_scene_to_file("res://scenes/PostBattleSummary.tscn")
    await get_tree().process_frame
    var post_mgr = get_tree().current_scene.get_node("PostBattleManager")
    post_mgr.connect("post_battle_complete", Callable(self, "on_post_battle_continue"))

func on_post_battle_continue():
    print("on_post_battle_continue")
    change_to_rest()

func change_to_rest():
    get_tree().change_scene_to_file("res://scenes/RestScene.tscn")
    await get_tree().process_frame
    var rest_mgr = get_tree().current_scene.get_node("RestManager")
    rest_mgr.connect("rest_complete", Callable(self, "on_rest_continue"))

func on_rest_continue():
    print("on_rest_continue")
    change_to_dungeon_map()

func change_to_loot():
    get_tree().change_scene_to_file("res://scenes/LootPanel.tscn")
    await get_tree().process_frame
    var loot_mgr = get_tree().current_scene.get_node("LootPanel")
    # If LootPanel emits a custom signal, connect here. Otherwise, user presses “Collect” to continue.
