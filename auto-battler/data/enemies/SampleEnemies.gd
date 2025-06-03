extends Node
class_name SampleEnemies

## Returns an array of EnemyData resources for prototyping enemy encounters.
static func get_enemies() -> Array[EnemyData]:
    var enemies: Array[EnemyData] = []

    var rotgrub_swarm := EnemyData.new()
    rotgrub_swarm.enemy_name = "Rotgrub Swarm"
    rotgrub_swarm.description = "A mass of hungry, biting grubs that overwhelm foes with numbers."
    rotgrub_swarm.enemy_type = EnemyData.EnemyType.Creature
    rotgrub_swarm.abilities = ["Bite Swarm", "Burrow Latch"]
    rotgrub_swarm.base_hp = 9
    rotgrub_swarm.base_attack = 2
    rotgrub_swarm.speed_modifier = 3
    rotgrub_swarm.loot_table = ["Mossy Meat", "Grub Ichor"]
    rotgrub_swarm.encounter_weight = 4
    rotgrub_swarm.icon_path = "res://assets/sprites/enemies/rotgrub_swarm.png"
    rotgrub_swarm.passive_traits = ["Immune to poison", "May multiply if not killed quickly"]
    enemies.append(rotgrub_swarm)

    var spore_witch := EnemyData.new()
    spore_witch.enemy_name = "Spore Witch"
    spore_witch.description = "A twisted sorcerer harnessing hallucinogenic spores."
    spore_witch.enemy_type = EnemyData.EnemyType.DemiHuman
    spore_witch.abilities = ["Spore Veil", "Heal Fungus"]
    spore_witch.base_hp = 12
    spore_witch.base_attack = 3
    spore_witch.speed_modifier = 4
    spore_witch.loot_table = ["Spore Sack", "Minor Healing Elixir"]
    spore_witch.encounter_weight = 3
    spore_witch.icon_path = "res://assets/sprites/enemies/spore_witch.png"
    spore_witch.passive_traits = ["Heals herself if standing in fungal terrain"]
    enemies.append(spore_witch)

    var myconid_brute := EnemyData.new()
    myconid_brute.enemy_name = "Myconid Brute"
    myconid_brute.description = "Hulking fungal giant with armor-like hide."
    myconid_brute.enemy_type = EnemyData.EnemyType.Creature
    myconid_brute.abilities = ["Fungal Slam", "Thick Hide"]
    myconid_brute.base_hp = 15
    myconid_brute.base_attack = 4
    myconid_brute.speed_modifier = 2
    myconid_brute.loot_table = ["Myconid Plate", "Hardened Cap"]
    myconid_brute.encounter_weight = 3
    myconid_brute.icon_path = "res://assets/sprites/enemies/myconid_brute.png"
    myconid_brute.passive_traits = ["Takes -1 damage from non-fire attacks"]
    enemies.append(myconid_brute)

    var mushroom_shaman := EnemyData.new()
    mushroom_shaman.enemy_name = "Mushroom Shaman"
    mushroom_shaman.description = "Fungal mystic with powers over mind and decay."
    mushroom_shaman.enemy_type = EnemyData.EnemyType.DemiHuman
    mushroom_shaman.abilities = ["Mind Spore", "Hallucinate"]
    mushroom_shaman.base_hp = 11
    mushroom_shaman.base_attack = 3
    mushroom_shaman.speed_modifier = 3
    mushroom_shaman.loot_table = ["Spore Powder", "Mystic Fungus"]
    mushroom_shaman.encounter_weight = 2
    mushroom_shaman.icon_path = "res://assets/sprites/enemies/mushroom_shaman.png"
    mushroom_shaman.passive_traits = ["Occasionally buffs allies when attacked"]
    enemies.append(mushroom_shaman)

    return enemies
