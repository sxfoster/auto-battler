extends Node
class_name SampleCharacters

## Returns a few example CharacterData resources for prototyping.
static func get_characters() -> Array[CharacterData]:
    var list: Array[CharacterData] = []

    var guardian := CharacterData.new()
    guardian.character_name = "Aria"
    guardian.role = CharacterData.Role.Tank
    guardian.class_name = "Guardian"
    guardian.base_hp = 12
    guardian.base_attack = 3
    guardian.speed_modifier = 2
    guardian.profession = "Smithing"
    guardian.icon_path = "res://assets/sprites/characters/aria.png"
    list.append(guardian)

    var cleric := CharacterData.new()
    cleric.character_name = "Borin"
    cleric.role = CharacterData.Role.Healer
    cleric.class_name = "Cleric"
    cleric.base_hp = 10
    cleric.base_attack = 2
    cleric.speed_modifier = 3
    cleric.profession = "Alchemy"
    cleric.icon_path = "res://assets/sprites/characters/borin.png"
    list.append(cleric)

    return list
