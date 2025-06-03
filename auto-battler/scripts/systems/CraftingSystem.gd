extends Node
class_name CraftingSystem

## Handles magical pouch crafting. Accepts up to 5 ingredient cards and outputs
## a new card if a recipe is matched. Otherwise creates scrap.

signal crafted(result)

func craft_item(profession: ProfessionData, ingredients: Array) -> CardData:
    ## Main entry point for crafting cards.
    var inputs := ingredients.slice(0, 5)
    var recipe = _find_recipe(inputs)
    var output: CardData
    var success := false

    if recipe and profession.current_level >= recipe.required_level:
        output = recipe.result.duplicate()
        success = true
    else:
        output = _generate_failure_item()

    if _has_synergy(inputs):
        _upgrade_output(output)

    _apply_crafted_by_tag(output, profession)
    _grant_profession_xp(profession, success)
    _log_result(output, success)

    emit_signal("crafted", output)
    return output

func _find_recipe(inputs: Array):
    ## Placeholder for recipe lookup/discovery logic.
    ## Should check known and hidden recipes.
    return null

func _generate_failure_item() -> CardData:
    ## Placeholder for returning a Scrap or other low-value card.
    return CardData.new()

func _has_synergy(inputs: Array) -> bool:
    ## Placeholder for detecting synergy tags like "Rare Spice".
    return false

func _upgrade_output(card: CardData) -> void:
    ## Placeholder for improving card rarity or stats when synergy detected.
    pass

func _apply_crafted_by_tag(card: CardData, profession: ProfessionData) -> void:
    if card.synergy_tags == null:
        card.synergy_tags = []
    card.synergy_tags.append("crafted_by")
    if profession.crafted_by_tag != "":
        card.synergy_tags.append(profession.crafted_by_tag)

func _grant_profession_xp(profession: ProfessionData, success: bool) -> void:
    ## Placeholder for XP gain and level up handling.
    pass

func _log_result(card: CardData, success: bool) -> void:
    var outcome = "Crafted" if success else "Failed, produced"
    print("%s: %s" % [outcome, card.card_name])
