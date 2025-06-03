extends Node
class_name PreparationManager

signal party_updated
signal gear_updated
signal consumables_updated

var party: Array = []
var consumables: Array = []

func _ready() -> void:
    _load_party()

func _load_party() -> void:
    if Engine.has_singleton("GameManager"):
        var gm = Engine.get_singleton("GameManager")
        if gm.has_method("get_party"):
            party = gm.get_party()
        if gm.has("consumables"):
            consumables = gm.consumables
    party_updated.emit()

func assign_card(member_index: int, card: Resource) -> void:
    if member_index < 0 or member_index >= party.size():
        return
    var member = party[member_index]
    if not member.assigned_cards:
        member.assigned_cards = []
    if card in member.assigned_cards:
        return
    if member.assigned_cards.size() < 4:
        member.assigned_cards.append(card)
        party_updated.emit()

func unassign_card(member_index: int, card: Resource) -> void:
    if member_index < 0 or member_index >= party.size():
        return
    var member = party[member_index]
    if member.assigned_cards and card in member.assigned_cards:
        member.assigned_cards.erase(card)
        party_updated.emit()

func equip_gear(member_index: int, gear: Resource) -> void:
    if member_index < 0 or member_index >= party.size():
        return
    var member = party[member_index]
    if not member.equipped_gear:
        member.equipped_gear = []
    if gear in member.equipped_gear:
        return
    member.equipped_gear.append(gear)
    gear_updated.emit()

func select_consumable(slot: int, item: Resource) -> void:
    while consumables.size() <= slot:
        consumables.append(null)
    consumables[slot] = item
    consumables_updated.emit()

func enter_dungeon() -> void:
    if ResourceLoader.exists("res://scenes/DungeonMap.tscn"):
        get_tree().change_scene_to_file("res://scenes/DungeonMap.tscn")

func _on_EnterDungeonButton_pressed() -> void:
    enter_dungeon()
