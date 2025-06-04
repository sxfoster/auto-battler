class_name CardLibrary
extends Node


static func _create_card(
	card_name: String,
	description: String,
	card_type: CardData.CardType,
	role_restriction: String,
	class_restriction: String,
	effect_description: String,
	icon_name: String,
	synergy_tags: Array = [],
	energy_cost: int = 1,
	is_combo_starter: bool = false,
	is_combo_finisher: bool = false
) -> CardData:
	var c = CardData.new()
	c.card_name = card_name
	c.description = description
	c.card_type = card_type
	c.role_restriction = role_restriction
	c.class_restriction = class_restriction
	c.effect_description = effect_description
	c.rarity = CardData.Rarity.Common
	c.icon_path = "res://assets/cards/%s.png" % icon_name
	c.synergy_tags = synergy_tags
	c.energy_cost = energy_cost
	c.is_combo_starter = is_combo_starter
	c.is_combo_finisher = is_combo_finisher
	return c


static func get_all_cards() -> Array[CardData]:
	var cards: Array[CardData] = []

	cards.append(
		_create_card(
			"Shield Bash",
			"Slam enemy with shield, may stun.",
			CardData.CardType.Attack,
			"Tank",
			"Guardian, Warrior",
			"1–3 dmg, 25% stun chance.",
			"shield_bash"
		)
	)

	cards.append(
		_create_card(
			"Fortify",
			"Harden defenses for a short period.",
			CardData.CardType.Buff,
			"Tank",
			"Warrior",
			"+1 Armor (2 turns).",
			"fortify",
			["TauntSynergy"]
		)
	)

	cards.append(
		_create_card(
			"Taunt",
			"Draw enemy attacks to self.",
			CardData.CardType.Utility,
			"Tank",
			"Guardian",
			"Enemies focus attacks on user for 1 round.",
			"taunt"
		)
	)

	cards.append(
		_create_card(
			"Iron Will",
			"Resist debuffs and control effects.",
			CardData.CardType.Buff,
			"Tank",
			"Any",
			"Immune to debuffs this round.",
			"iron_will"
		)
	)

	cards.append(
		_create_card(
			"Bodyguard",
			"Protect a weak ally.",
			CardData.CardType.Utility,
			"Tank",
			"Guardian",
			"Redirect next attack targeting an ally to self.",
			"bodyguard"
		)
	)

	cards.append(
		_create_card(
			"Mending Touch",
			"Restore moderate HP to an ally.",
			CardData.CardType.Heal,
			"Healer",
			"Cleric",
			"Heal 2–4 HP.",
			"mending_touch"
		)
	)

	cards.append(
		_create_card(
			"Purify",
			"Remove all debuffs from a party member.",
			CardData.CardType.Utility,
			"Healer",
			"Cleric",
			"Cleanse all debuffs on target.",
			"purify"
		)
	)

	cards.append(
		_create_card(
			"Revitalize",
			"Small heal + fatigue reduction.",
			CardData.CardType.Heal,
			"Healer",
			"Any",
			"Heal 1–2 HP, -1 Fatigue.",
			"revitalize"
		)
	)

	cards.append(
		_create_card(
			"Sanctuary",
			"Shield party from next damage.",
			CardData.CardType.Buff,
			"Healer",
			"Cleric",
			"Next damage instance to party reduced by 2.",
			"sanctuary"
		)
	)

	cards.append(
		_create_card(
			"Bless",
			"Enhance an ally’s next action.",
			CardData.CardType.Buff,
			"Healer",
			"Any",
			"Next ability used by target gets +1 effect.",
			"bless"
		)
	)

	cards.append(
		_create_card(
			"Rally Cry",
			"Inspire allies, boosting attack.",
			CardData.CardType.Buff,
			"Support",
			"Bard",
			"All allies +1 damage for next attack.",
			"rally_cry"
		)
	)

	cards.append(
		_create_card(
			"Mood Maker",
			"Bestows a random buff to an ally.",
			CardData.CardType.Buff,
			"Support",
			"Bard",
			"Random: +1 ATK, +1 DEF, or +1 Energy Regen.",
			"mood_maker"
		)
	)

	cards.append(
		_create_card(
			"Quick Tune",
			"Let an ally act sooner.",
			CardData.CardType.Buff,
			"Support",
			"Bard",
			"Next turn: target ally acts at top of order.",
			"quick_tune"
		)
	)

	cards.append(
		_create_card(
			"Disarm",
			"Reduce enemy’s attack.",
			CardData.CardType.Debuff,
			"Support",
			"Any",
			"Target enemy deals -1 damage on next attack.",
			"disarm"
		)
	)

	cards.append(
		_create_card(
			"Encore",
			"Grant extra action to ally.",
			CardData.CardType.Utility,
			"Support",
			"Bard",
			"Ally may repeat last used card.",
			"encore"
		)
	)

	cards.append(
		_create_card(
			"Quick Slash",
			"Fast melee attack.",
			CardData.CardType.Attack,
			"DPS",
			"Blademaster",
			"2–4 damage, physical.",
			"quick_slash"
		)
	)

	cards.append(
		_create_card(
			"Arcane Spark",
			"Burst of magical energy.",
			CardData.CardType.Attack,
			"DPS",
			"Wizard",
			"2–4 magic damage.",
			"arcane_spark"
		)
	)

	cards.append(
		_create_card(
			"Flurry",
			"Multiple low-damage hits.",
			CardData.CardType.Attack,
			"DPS",
			"Blademaster",
			"1–2 damage, hit 2 times.",
			"flurry"
		)
	)

	cards.append(
		_create_card(
			"Venom Strike",
			"Apply poison effect.",
			CardData.CardType.Debuff,
			"DPS",
			"Any",
			"1–2 damage, +1 DoT (2 turns).",
			"venom_strike"
		)
	)

	cards.append(
		_create_card(
			"Finisher",
			"Extra damage if enemy was hit this round.",
			CardData.CardType.Attack,
			"DPS",
			"Blademaster",
			"3–5 damage if enemy already damaged this round.",
			"finisher",
			[],
			1,
			false,
			true
		)
	)

	return cards
