class_name PreparationManager
extends Node

# Signal emitted when the party is ready to enter the dungeon
signal party_ready_for_dungeon

# Exported variables for configuration
@export var max_cards_per_member: int = 4
@export var max_gear_pieces_per_member: int = 2  # Example, adjust as needed
@export var max_consumable_slots: int = 4  # Example, adjust as needed

# Data variables
# Holds data for party members, including their assigned cards and gear
var party_members_data: Array = []
# Holds data for available cards (e.g., player's deck)
var available_cards_data: Array = []
# Holds data for available gear (e.g., player's inventory)
var available_gear_data: Array = []
# Holds data for selected consumables for quick slots
var selected_consumables_data: Array = []
# Holds data for player's professions and their levels/xp
var professions_data: Dictionary = {}


func _ready() -> void:
	# Initial setup when the node is ready
	load_party_data()

	# Connect to the PreparationScene's signal if present
	var scene := get_tree().current_scene
	if scene and scene.has_signal("enter_dungeon_pressed"):
		if not scene.is_connected(
			"enter_dungeon_pressed", Callable(self, "_on_enter_dungeon_pressed")
		):
			scene.connect("enter_dungeon_pressed", Callable(self, "_on_enter_dungeon_pressed"))


func load_party_data() -> void:
	# This function should load all necessary information:
	# - Party members (stats, class, etc.)
	# - Their initially assigned cards and gear (if any from a save)
	# - All available cards the player owns
	# - All available gear the player owns
	# - Available consumables
	# - Player's professions data
	# This will likely interact with GameManager or a dedicated data source/save file.

	# Example placeholder logic:
	if Engine.has_singleton("GameManager"):
		var gm = Engine.get_singleton("GameManager")
		if gm.has_method("get_player_party_data"):  # Assuming GameManager has this
			party_members_data = gm.get_player_party_data()
		if gm.has_method("get_player_available_cards"):
			available_cards_data = gm.get_player_available_cards()
		if gm.has_method("get_player_available_gear"):
			available_gear_data = gm.get_player_available_gear()
		if gm.has_method("get_player_professions"):
			professions_data = gm.get_player_professions()
		# Initialize selected consumables with nulls based on max_consumable_slots
		selected_consumables_data.resize(max_consumable_slots)
		selected_consumables_data.fill(null)
		# If loading saved consumables:
		# if gm.has_method("get_player_selected_consumables"):
		# selected_consumables_data = gm.get_player_selected_consumables()

	# Emit a signal if UI needs to be updated after loading, e.g.
	# party_data_loaded.emit() # Consider adding such a signal if needed


func assign_card_to_member(card_data: Resource, member_index: int) -> void:
	# Assigns a card to a party member.
	# Logic to check:
	# - If member_index is valid.
	# - If the member can equip more cards (using max_cards_per_member).
	# - If the card is not already assigned to this member.
	# - Potentially, class/level restrictions for the card.
	if member_index < 0 or member_index >= party_members_data.size():
		printerr("assign_card_to_member: Invalid member_index")
		return

	var member = party_members_data[member_index]
	# Ensure 'assigned_cards' array exists for the member
	if not member.has("assigned_cards"):
		member.assigned_cards = []

	if card_data in member.assigned_cards:
		print("Card already assigned to this member.")
		return

	if member.assigned_cards.size() >= max_cards_per_member:
		print("Member cannot equip more cards.")
		return

	# Validate assignment against character rules (e.g. class, level)
	# if not _can_member_equip_card(member, card_data):
	# print("Member does not meet requirements for this card.")
	# return

	member.assigned_cards.append(card_data)
	# Emit a signal to update UI, e.g., member_cards_updated.emit(member_index, member.assigned_cards)


func unassign_card_from_member(card_data: Resource, member_index: int) -> void:
	# Unassigns a card from a party member.
	# Logic to check:
	# - If member_index is valid.
	# - If the card is actually assigned to this member.
	if member_index < 0 or member_index >= party_members_data.size():
		printerr("unassign_card_from_member: Invalid member_index")
		return

	var member = party_members_data[member_index]
	if member.has("assigned_cards") and card_data in member.assigned_cards:
		member.assigned_cards.erase(card_data)
		# Emit a signal to update UI
	else:
		print("Card not found in member's assigned cards.")


func assign_gear_to_member(gear_data: Resource, member_index: int) -> void:
	# Assigns a piece of gear to a party member.
	# Logic to check:
	# - If member_index is valid.
	# - If the member can equip more gear of this type (e.g., only one helmet).
	# - If the gear is not already assigned.
	# - Class/level restrictions.
	if member_index < 0 or member_index >= party_members_data.size():
		printerr("assign_gear_to_member: Invalid member_index")
		return

	var member = party_members_data[member_index]
	# Ensure 'equipped_gear' array exists for the member
	if not member.has("equipped_gear"):
		member.equipped_gear = []

	# Example: Check against max_gear_pieces_per_member (could be more granular by type)
	if member.equipped_gear.size() >= max_gear_pieces_per_member:
		print("Member cannot equip more gear.")
		return

	# Validate assignment against character rules and gear type conflicts
	# if not _can_member_equip_gear(member, gear_data):
	# print("Member does not meet requirements for this gear or slot is full.")
	# return

	member.equipped_gear.append(gear_data)
	# Emit a signal to update UI


func unassign_gear_from_member(gear_data: Resource, member_index: int) -> void:
	# Unassigns a piece of gear from a party member.
	# Logic to check:
	# - If member_index is valid.
	# - If the gear is actually assigned to this member.
	if member_index < 0 or member_index >= party_members_data.size():
		printerr("unassign_gear_from_member: Invalid member_index")
		return

	var member = party_members_data[member_index]
	if member.has("equipped_gear") and gear_data in member.equipped_gear:
		member.equipped_gear.erase(gear_data)
		# Emit a signal to update UI
	else:
		print("Gear not found in member's equipped gear.")


func select_consumable_for_slot(consumable_data: Resource, slot_index: int) -> void:
	# Places a consumable into a quick slot.
	# Logic to check:
	# - If slot_index is valid (within max_consumable_slots).
	# - If the consumable_data is valid.
	if slot_index < 0 or slot_index >= max_consumable_slots:
		printerr("select_consumable_for_slot: Invalid slot_index")
		return

	# Ensure selected_consumables_data is initialized
	if selected_consumables_data.size() != max_consumable_slots:
		selected_consumables_data.resize(max_consumable_slots)
		selected_consumables_data.fill(null)  # Initialize with nulls

	selected_consumables_data[slot_index] = consumable_data
	# Emit a signal to update UI, e.g., consumables_updated.emit(selected_consumables_data)


func _on_enter_dungeon_pressed() -> void:
	# This function is typically connected to a UI button press.
	# It finalizes party preparations and signals that the party is ready.
	# GameManager will pick this signal up to transition to the Dungeon Map scene.

	# Add any final validation here:
	# e.g., ensure each party member has at least one card, or a weapon equipped.
	# if not _is_party_configuration_valid():
	#     print("Party configuration is not valid for dungeon entry.")
	#     # Optionally, show a UI message to the player
	#     return

	# Gather the configured party data. Duplicate to avoid accidental mutation
	var party_data := party_members_data.duplicate(true)

	# Attempt to pass this data to the GameManager singleton
	var gm := (
		Engine.get_singleton("GameManager")
		if Engine.has_singleton("GameManager")
		else get_node_or_null("/root/GameManager")
	)

	if gm:
		if gm.has_method("start_dungeon_run"):
			gm.start_dungeon_run(party_data)
		else:
			# Fallback to the existing signal-based flow
			party_ready_for_dungeon.emit()
		print("PreparationManager: Party ready for dungeon!")
	else:
		printerr("PreparationManager: GameManager not found. Cannot start dungeon run.")
