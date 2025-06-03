extends Resource
class_name ProfessionData

## A Resource representing a character profession for crafting or other systems

@export var profession_name: String = ""
@export var description: String = ""
@export var max_level: int = 1
@export var current_level: int = 1
@export var known_recipes: Array = []
@export var crafting_bonus: float = 0.0
@export var exclusive_cards: Array[CardData] = []
@export var crafted_by_tag: String = ""
