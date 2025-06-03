extends Resource
class_name CharacterData

## Resource representing a party member for the CCG auto-battler.
## Saved as .tres files for use in the editor.

# Roles a character can fulfill in combat.
# Using an enum allows selecting via drop-down in the editor.
enum Role {
    TANK,
    HEALER,
    SUPPORT,
    DPS
}

# Character identity
export(String) var character_name : String = ""
export(int, "Tank", "Healer", "Support", "DPS") var role : int = Role.TANK
export(String) var class_name : String = ""

# Base combat stats
export(int) var base_hp : int = 0
export(int) var base_attack : int = 0
export(int) var speed_modifier : int = 0

# Card and equipment lists
export(Array, Resource) var assigned_cards : Array = []    # Array[CardData] up to 4
export(Array, Resource) var equipped_gear : Array = []     # Array[CardData] Equipment

# Non-combat and survival stats
export(String) var profession : String = ""
export(int) var hunger : int = 0
export(int) var thirst : int = 0
export(int) var fatigue : int = 0

# Inventory and visuals
export(Array, Resource) var inventory : Array = []         # Array[CardData]
export(String, FILE) var icon_path : String = ""
