extends Resource
class_name RecipeData

## Resource representing a crafting recipe.

@export var recipe_name: String = ""
@export var input_cards: Array = []      ## Array[CardData] or String identifiers
@export var output_card: CardData
@export var profession_required: String = ""
@export var level_required: int = 1
@export var synergy_tags: Array[String] = []
@export var discovered: bool = false

func matches_inputs(inputs: Array) -> bool:
    ## Return true if the given input cards match this recipe.
    if inputs.size() != input_cards.size():
        return false
    var remaining := inputs.duplicate()
    for expected in input_cards:
        var idx := remaining.find(expected)
        if idx == -1:
            return false
        remaining.remove_at(idx)
    return remaining.is_empty()
