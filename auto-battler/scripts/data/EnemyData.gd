extends Resource
class_name EnemyData

# Resource data for enemy definitions used in encounters.
# Allows creation of .tres files within the Godot editor.

# Types of enemies that can appear in the game.
enum EnemyType {
    CREATURE,
    DEMI_HUMAN,
    UNDEAD,
    BOSS
}

@export var enemy_name: String = ""
@export var description: String = ""
@export var enemy_type: EnemyType = EnemyType.CREATURE
# List of abilities this enemy can use. Each entry can be a CardData resource
# or a string referring to an ability name.
@export var abilities: Array = []

@export var base_hp: int = 0
@export var base_attack: int = 0
@export var speed_modifier: int = 0

# Array describing the potential loot dropped when this enemy is defeated.
@export var loot_table: Array = []

# Higher values make this enemy more likely to appear in random encounters.
@export var encounter_weight: int = 1

# Optional icon used when displaying the enemy in UI.
@export var icon_path: String = ""

# Array of passive traits that always affect this enemy, such as resistances.
@export var passive_traits: Array[String] = []
