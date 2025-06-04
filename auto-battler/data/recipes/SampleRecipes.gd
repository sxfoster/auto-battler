extends Node
class_name SampleRecipes


static func _create_card(name: String, desc: String) -> CardData:
	var c := CardData.new()
	c.card_name = name
	c.description = desc
	c.card_type = CardData.CardType.Utility
	return c


static func get_recipes() -> Array[RecipeData]:
	var recipes: Array[RecipeData] = []
	recipes.append(mushroom_soup())
	recipes.append(reinforced_sword())
	recipes.append(healing_elixir())
	return recipes


static func get_recipe_by_name(name: String) -> RecipeData:
	for r in get_recipes():
		if r.recipe_name == name:
			return r
	return null


static func mushroom_soup() -> RecipeData:
	var r := RecipeData.new()
	r.recipe_name = "Mushroom Soup"
	r.input_cards = ["Mushroom", "Water"]
	r.output_card = _create_card("Mushroom Soup", "Warm soup made from mushrooms.")
	r.profession_required = "Cooking"
	r.level_required = 1
	r.synergy_tags = []
	r.discovered = true
	return r


static func reinforced_sword() -> RecipeData:
	var r := RecipeData.new()
	r.recipe_name = "Reinforced Sword"
	r.input_cards = ["Iron Ore", "Wood"]
	r.output_card = _create_card("Reinforced Sword", "Sturdier than a basic blade.")
	r.profession_required = "Smithing"
	r.level_required = 1
	r.synergy_tags = []
	r.discovered = true
	return r


static func healing_elixir() -> RecipeData:
	var r := RecipeData.new()
	r.recipe_name = "Healing Elixir"
	r.input_cards = ["Herb", "Water"]
	r.output_card = _create_card("Healing Elixir", "Restores a small amount of health.")
	r.profession_required = "Alchemy"
	r.level_required = 1
	r.synergy_tags = []
	r.discovered = true
	return r
