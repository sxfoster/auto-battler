class_name CardData
extends Resource

# Resource describing a card used throughout the Survival Dungeon CCG.

enum CardType {
	ABILITY, ATTACK, BUFF, HEAL, DEBUFF, UTILITY, EQUIPMENT, INGREDIENT, FOODDRINK, ELIXIR
}

enum Rarity { COMMON, UNCOMMON, RARE, LEGENDARY }

@export var card_name: String = ""
@export_multiline var description: String = ""  # Multiline for better editor UX
@export var card_type: CardType = CardType.Ability
@export var role_restriction: String = ""
@export var class_restriction: String = ""
@export_multiline var effect_description: String = ""
@export var rarity: Rarity = Rarity.Common
@export_file("*.png", "*.jpg", "*.jpeg", "*.webp") var icon_path: String = ""
@export var synergy_tags: Array[String] = []
@export var energy_cost: int = 0
@export var is_combo_starter: bool = false
@export var is_combo_finisher: bool = false


func apply_effect(_target) -> void:
	# Placeholder for applying the card's effect to a target.
	# Actual implementation will depend on the game's combat system.
	pass
