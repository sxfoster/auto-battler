@tool
extends EditorScript

## Generates card and enemy .tres resources from sample lists.

static func _sanitize(name: String) -> String:
    var result := ""
    for part in name.split(" "):
        result += part.capitalize()
    result = result.replace("-", "").replace("'", "")
    return result

func _run() -> void:
    _generate_cards()
    _generate_enemies()
    print("Sample resources generated.")

func _generate_cards() -> void:
    var cards := CardLibrary.get_all_cards()
    for card in cards:
        var fname := _sanitize(card.card_name)
        var path := "res://data/cards/%s.tres" % fname
        ResourceSaver.save(card, path)

func _generate_enemies() -> void:
    var enemies := SampleEnemies.get_enemies()
    for enemy in enemies:
        var fname := _sanitize(enemy.enemy_name)
        var path := "res://data/enemies/%s.tres" % fname
        ResourceSaver.save(enemy, path)
