class_name CardData
extends Resource

# Content for fields and enums will be added in subsequent steps.

enum CardType {
	Ability,
	Equipment,
	Ingredient,
	FoodDrink,
	Elixir,
	Utility
}

enum Rarity {
	Common,
	Uncommon,
	Rare,
	Legendary
}

@export var card_name: String = ""
@export_multiline var description: String = "" # Use multiline for better editor experience
@export var card_type: CardType = CardType.Ability # Default to Ability
@export var role_restriction: String = "" # e.g., "Tank", "Healer", "DPS"
@export var class_restriction: String = "" # e.g., "Warrior", "Mage"
@export_multiline var effect_description: String = ""
@export var rarity: Rarity = Rarity.Common # Default to Common
@export_file("*.png", "*.jpg", "*.jpeg", "*.webp") var icon_path: String = ""
@export var synergy_tags: Array[String] = []
@export var energy_cost: int = 0
@export var is_combo_starter: bool = false
@export var is_combo_finisher: bool = false

func apply_effect(target) -> void:
	# Placeholder for applying the card's effect to a target.
	# Actual implementation will depend on the game's combat system.
	pass
