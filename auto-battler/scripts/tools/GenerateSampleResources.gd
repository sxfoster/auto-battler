@tool
extends EditorScript

## Generates .tres resources from the various sample lists.

static func _sanitize(name: String) -> String:
    var result := ""
    for part in name.split(" "):
        result += part.capitalize()
    result = result.replace("-", "").replace("'", "")
    return result

func _run() -> void:
    _generate_cards()
    _generate_professions()
    _generate_recipes()
    print("Sample resources generated.")

func _generate_cards() -> void:
    var cards := CardLibrary.get_all_cards()
    for card in cards:
        var fname := _sanitize(card.card_name)
        var path := "res://data/cards/%s.tres" % fname
        ResourceSaver.save(card, path)

func _generate_enemies() -> void:
    pass
    # var enemies := SampleEnemies.get_enemies()
    # for enemy in enemies:
    #     var fname := _sanitize(enemy.enemy_name)
    #     var path := "res://data/enemies/%s.tres" % fname
    #     ResourceSaver.save(enemy, path)

func _generate_professions() -> void:
    var professions := SampleProfessions.get_professions()
    for prof in professions:
        var fname := _sanitize(prof.profession_name)
        var path := "res://data/professions/%s.tres" % fname
        ResourceSaver.save(prof, path)

func _generate_recipes() -> void:
    var recipes := SampleRecipes.get_recipes()
    for recipe in recipes:
        var fname := _sanitize(recipe.recipe_name)
        var path := "res://data/recipes/%s.tres" % fname
        ResourceSaver.save(recipe, path)

func _generate_characters() -> void:
    pass
    # var chars := SampleCharacters.get_characters()
    # for ch in chars:
    #     var fname := _sanitize(ch.character_name)
    #     var path := "res://data/characters/%s.tres" % fname
    #     ResourceSaver.save(ch, path)
