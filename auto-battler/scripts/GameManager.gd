extends Node
class_name GameManager

var party_data: Variant

func start_run():
    change_to_preparation()

func change_to_preparation():
    get_tree().change_scene_to_file("res://scenes/PreparationScene.tscn")

func on_preparation_done(party_data):
    self.party_data = party_data
    change_to_dungeon_map()

func change_to_dungeon_map():
    get_tree().change_scene_to_file("res://scenes/DungeonMap.tscn")

func on_node_selected(node_type):
    if node_type == "combat":
        change_to_combat()
    elif node_type == "rest":
        change_to_rest()
    else:
        change_to_loot()

func change_to_combat():
    get_tree().change_scene_to_file("res://scenes/CombatScene.tscn")

func change_to_loot():
    get_tree().change_scene_to_file("res://scenes/LootPanel.tscn")

func change_to_rest():
    get_tree().change_scene_to_file("res://scenes/RestScene.tscn")

func on_combat_ended(victory):
    if victory:
        change_to_post_battle()
    else:
        get_tree().change_scene_to_file("res://scenes/GameOver.tscn")

func change_to_post_battle():
    get_tree().change_scene_to_file("res://scenes/PostBattleScene.tscn")

func on_post_battle_continue():
    change_to_rest()

func on_rest_continue():
    change_to_dungeon_map()
