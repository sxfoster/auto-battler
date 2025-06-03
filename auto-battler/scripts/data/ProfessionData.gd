extends Resource
class_name ProfessionData

## A Resource representing a character profession for crafting or other systems

@export var profession_name: String = ""
@export var description: String = ""
@export var max_level: int = 10
@export var current_level: int = 1
@export var known_recipes: Array = []
@export var crafting_bonus: float = 0.0
@export var exclusive_cards: Array[CardData] = []
@export var crafted_by_tag: String = ""

var current_xp: int = 0
var xp_to_next_level: int = 100

func grant_xp(amount: int, crafted_card: CardData) -> void:
    ## Add profession experience when crafting a card.
    current_xp += amount
    if crafted_card:
        _apply_crafted_by(crafted_card)
    while current_xp >= xp_to_next_level and current_level < max_level:
        current_xp -= xp_to_next_level
        level_up()

func level_up() -> void:
    if current_level < max_level:
        current_level += 1
        unlock_new_recipes()

func unlock_new_recipes() -> void:
    ## Unlock additional recipes when leveling up.
    pass

func _apply_crafted_by(card: CardData) -> void:
    ## Tag crafted cards for attribution.
    if crafted_by_tag != "":
        card.set("crafted_by", crafted_by_tag)
