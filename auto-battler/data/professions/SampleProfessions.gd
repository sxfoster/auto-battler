extends Node
class_name SampleProfessions


static func get_professions() -> Array[ProfessionData]:
	var list: Array[ProfessionData] = []

	var cooking := ProfessionData.new()
	cooking.profession_name = "Cooking"
	cooking.description = "Creates food and drink cards"
	cooking.current_level = 1
	cooking.known_recipes = [SampleRecipes.mushroom_soup()]
	cooking.crafted_by_tag = "Chef"
	list.append(cooking)

	var smithing := ProfessionData.new()
	smithing.profession_name = "Smithing"
	smithing.description = "Creates and upgrades equipment"
	smithing.current_level = 1
	smithing.known_recipes = [SampleRecipes.reinforced_sword()]
	smithing.crafted_by_tag = "Blacksmith"
	list.append(smithing)

	var alchemy := ProfessionData.new()
	alchemy.profession_name = "Alchemy"
	alchemy.description = "Brews elixirs and utility items"
	alchemy.current_level = 1
	alchemy.known_recipes = [SampleRecipes.healing_elixir()]
	alchemy.crafted_by_tag = "Alchemist"
	list.append(alchemy)

	return list
