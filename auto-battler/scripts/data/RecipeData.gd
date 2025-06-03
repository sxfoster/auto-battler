extends Resource
class_name RecipeData

## Resource representing a crafting recipe.

@export var recipe_name: String = ""
@export var description: String = ""
@export var profession: String = "" # e.g., Cooking, Smithing, Alchemy
@export var required_level: int = 1
@export var ingredients: Array = [] # Array[CardData] or String names
@export var output_card: CardData
@export var success_rate: float = 1.0
