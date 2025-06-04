extends Resource
class_name CharacterData

enum Role { TANK, HEALER, SUPPORT, DPS }

@export var character_name: String = ""
@export var role: Role = Role.Tank
@export var character_class: String = ""
@export var base_hp: int = 10
@export var base_attack: int = 2
@export var speed_modifier: int = 1
@export var assigned_cards: Array = []
@export var equipped_gear: Array = []
@export var profession: String = ""
@export var hunger: int = 0
@export var thirst: int = 0
@export var fatigue: int = 0
@export var inventory: Array = []
@export var icon_path: String = ""
