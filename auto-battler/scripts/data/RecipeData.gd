extends Resource
class_name RecipeData

## Resource representing a crafting recipe.

@export var recipe_name: String = ""
@export var input_cards: Array = []  ## Array[CardData] or card name Strings
@export var output_card: CardData
@export var profession_required: String = ""
@export var level_required: int = 1
@export var synergy_tags: Array[String] = []
@export var discovered: bool = false


func matches_inputs(inputs: Array) -> bool:
	## Return true if the given input cards match this recipe.
	## Allows comparison by CardData resource or card name String.
	if inputs.size() != input_cards.size():
		return false
	var remaining := inputs.duplicate()
	for expected in input_cards:
		var matched := false
		var expected_name = expected if typeof(expected) == TYPE_STRING else expected.card_name
		for i in range(remaining.size()):
			var check = remaining[i]
			var check_name = check if typeof(check) == TYPE_STRING else check.card_name
			if check_name == expected_name:
				remaining.remove_at(i)
				matched = true
				break
		if not matched:
			return false
	return remaining.is_empty()
