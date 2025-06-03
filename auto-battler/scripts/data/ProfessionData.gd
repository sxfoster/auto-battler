extends Resource
class_name ProfessionData

## A Resource representing a character profession for crafting or other systems

@export var profession_name: String = ""
@export var description: String = ""
@export var max_level: int = 10
@export var current_level: int = 1
# Array of known recipes. Can hold RecipeData resources or strings referring to recipes.
# Using Array[Resource] for editor type hinting if RecipeData is a Resource.
@export var known_recipes: Array[Resource] = []
@export var crafting_bonus: float = 0.0
@export var exclusive_cards: Array[CardData] = []
@export var crafted_by_tag: String = ""
