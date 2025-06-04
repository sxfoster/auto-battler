extends Node

const SCENES := {
    "MainMenu": "res://scenes/MainMenu.tscn",
    "PartySetup": "res://scenes/PartySetup.tscn",
    "PreparationScene": "res://scenes/PreparationScene.tscn",
    "DungeonMap": "res://scenes/DungeonMap.tscn",
    "CombatScene": "res://scenes/CombatScene.tscn",
    "PostBattleSummary": "res://scenes/PostBattleSummary.tscn",
    "RestScene": "res://scenes/RestScene.tscn",
    "SettingsScene": "res://scenes/SettingsScene.tscn",
    "CraftingScene": "res://scenes/CraftingScene.tscn",
    "LootPanel": "res://scenes/LootPanel.tscn",
    "EventPanel": "res://scenes/EventPanel.tscn",
    "InventoryCrafting": "res://scenes/InventoryCrafting.tscn",
    "Bootstrap": "res://scenes/Bootstrap.tscn"
}

func goto_scene(key: String) -> void:
    if !SCENES.has(key):
        push_error("SceneLoader: Unknown scene key %s" % key)
        return
    get_tree().change_scene_to_file(SCENES[key])


