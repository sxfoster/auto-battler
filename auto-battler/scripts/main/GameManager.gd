class_name GameManager
extends Node

var party_data

func start_run():
    print("GameManager.start_run()")
    change_to_preparation()

func change_to_preparation():
    print("GameManager.change_to_preparation()")
    get_tree().change_scene_to_file("res://scenes/PreparationScene.tscn")

func on_preparation_done(party_data):
    self.party_data = party_data
    change_to_dungeon_map()

func change_to_dungeon_map():
    print("GameManager.change_to_dungeon_map()")
    get_tree().change_scene_to_file("res://scenes/DungeonMap.tscn")

func on_node_selected(node_type):
    if node_type == "combat":
        change_to_combat()
    elif node_type == "rest":
        change_to_rest()
    else:
        change_to_loot()

func change_to_combat():
    print("GameManager.change_to_combat()")
    get_tree().change_scene_to_file("res://scenes/CombatScene.tscn")

func on_combat_ended(victory):
    if victory:
        change_to_post_battle()
    else:
        get_tree().change_scene_to_file("res://scenes/GameOver.tscn")

func change_to_post_battle():
    print("GameManager.change_to_post_battle()")
    get_tree().change_scene_to_file("res://scenes/PostBattleSummary.tscn")

func on_post_battle_continue():
    change_to_rest()

func change_to_rest():
    print("GameManager.change_to_rest()")
    get_tree().change_scene_to_file("res://scenes/RestScene.tscn")

func on_rest_continue():
    change_to_dungeon_map()

func change_to_loot():
    print("GameManager.change_to_loot()")
    get_tree().change_scene_to_file("res://scenes/LootScene.tscn")
