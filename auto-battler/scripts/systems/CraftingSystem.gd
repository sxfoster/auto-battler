extends Node
class_name CraftingSystem

## Handles magical pouch crafting. Accepts up to 5 ingredient cards and outputs
## a new card if a recipe is matched. Otherwise creates scrap.

signal crafted(result)

func craft_item(profession: ProfessionData, ingredients: Array) -> CardData:
    ## Main entry point for crafting cards.
    var inputs := ingredients.slice(0, 5)
    var recipe: RecipeData = _find_recipe(profession, inputs)
    var output: CardData
    var success := false

    if recipe and profession.current_level >= recipe.level_required:
        output = recipe.output_card.duplicate()
        success = true
    else:
        output = _generate_failure_item()

    if _has_synergy(inputs):
        _upgrade_output(output)

    _grant_profession_xp(profession, output, success)
    _log_result(output, success)

    emit_signal("crafted", output)
    return output

func _find_recipe(profession: ProfessionData, inputs: Array) -> RecipeData:
    ## Basic recipe lookup using profession's known recipes.
    for recipe in profession.known_recipes:
        if recipe.matches_inputs(inputs):
            return recipe
    ## Placeholder: also search hidden recipes here.
    return null

func _generate_failure_item() -> CardData:
    ## Return a generic Scrap card when no recipe matches.
    var scrap := CardData.new()
    scrap.card_name = "Scrap"
    scrap.description = "Leftover debris from failed crafting."
    scrap.card_type = CardData.CardType.Utility
    return scrap

func _has_synergy(inputs: Array) -> bool:
    ## Check for synergy tags such as "Rare Spice".
    for item in inputs:
        if item is CardData and "Rare Spice" in item.synergy_tags:
            return true
        if typeof(item) == TYPE_STRING and item == "Rare Spice":
            return true
    return false

func _upgrade_output(card: CardData) -> void:
    ## Improve output rarity when synergy is detected.
    if card.rarity < CardData.Rarity.Legendary:
        card.rarity += 1

func _apply_crafted_by_tag(card: CardData, profession: ProfessionData) -> void:
    if profession.crafted_by_tag != "":
        card.set("crafted_by", profession.crafted_by_tag)

func _grant_profession_xp(profession: ProfessionData, card: CardData, success: bool) -> void:
    ## Grant profession XP based on crafting success.
    var xp := 10 if success else 2
    profession.grant_xp(xp, card)

func _log_result(card: CardData, success: bool) -> void:
    var outcome = "Crafted" if success else "Failed, produced"
    print("%s: %s" % [outcome, card.card_name])
