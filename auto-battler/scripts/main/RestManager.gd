extends Node
class_name RestManager

## Handles the campfire rest phase between dungeon encounters.
## Players may use consumable cards to recover, craft items or
## repair gear before continuing the adventure.

signal rest_complete

@onready var _crafting := CraftingSystem.new()
@onready var _continue_button := get_node_or_null("ContinueButton")

var party_members: Array = [] ## Array[CharacterData]

func _ready() -> void:
    ## Connect button interaction when the scene is loaded.
    if _continue_button:
        _continue_button.pressed.connect(continue_adventure)

func use_consumable(card: CardData, member: CharacterData) -> void:
    ## Apply the effects of a food or drink card.
    if card.card_type != CardData.CardType.FoodDrink:
        return
    member.hunger = max(member.hunger - 1, 0)
    member.thirst = max(member.thirst - 1, 0)
    var hp := member.get("current_hp") if member.has_method("get") else null
    if hp == null:
        hp = member.base_hp
    hp = min(hp + 2, member.base_hp)
    member.set("current_hp", hp)

func craft(profession: ProfessionData, ingredients: Array) -> CardData:
    ## Delegate crafting to the CraftingSystem.
    return _crafting.craft_item(profession, ingredients)

func repair_gear(card: CardData) -> void:
    ## Placeholder for repairing a piece of equipment if it supports it.
    if card.has_method("repair"):
        card.repair(1)

func grant_profession_xp(profession: ProfessionData, amount: int) -> void:
    ## Grant additional XP to a profession.
    profession.grant_xp(amount, null)

func continue_adventure() -> void:
    ## Return to the dungeon map when the player is ready.
    get_tree().change_scene_to_file("res://scenes/DungeonMap.tscn")
    emit_signal("rest_complete")

