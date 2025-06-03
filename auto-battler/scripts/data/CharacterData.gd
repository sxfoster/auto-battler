extends Resource
class_name CharacterData

## Resource representing a party member in the Survival Dungeon CCG.
## Saved as .tres files for use in the editor.

# Roles a character can fulfill in combat.
# Using an enum allows selecting via drop-down in the editor.
enum Role {
    Tank,
    Healer,
    Support,
    DPS
}

# Character identity
@export var character_name : String = ""
@export var role : Role = Role.Tank
@export var class_name : String = ""

# Base combat stats
@export var base_hp : int = 0
@export var base_attack : int = 0
@export var speed_modifier : int = 0

# Card and equipment lists
@export var assigned_cards : Array[CardData] = []    # Array[CardData] up to 4
@export var equipped_gear : Array[CardData] = []     # Array[CardData] Equipment

# Non-combat and survival stats
@export var profession : String = ""
@export var hunger : int = 0
@export var thirst : int = 0
@export var fatigue : int = 0

# Inventory and visuals
@export var inventory : Array[CardData] = []         # Array[CardData]
@export_file var icon_path : String = ""
