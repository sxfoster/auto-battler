extends Control

# Signals for card assignment (placeholders)
signal card_assigned(member_index, card_slot, card_data)
signal gear_equipped(member_index, gear_slot, gear_data)

func _ready():
	# Initialize party member slots (e.g., load character data)
	# For now, we'll use placeholders
	for i in range(1, 6):
		var name_label = get_node_or_null("HBoxContainer/PartyMemberSlot" + str(i) + "/NameLabel" + str(i))
		if name_label:
			name_label.text = "Member " + str(i)

		# Initialize other labels and placeholders as needed
		var stats_label = get_node_or_null("HBoxContainer/PartyMemberSlot" + str(i) + "/StatsLabel" + str(i))
		if stats_label:
			# You can set default stats here if needed, or leave them as is from the scene file
			pass

		var cards_label = get_node_or_null("HBoxContainer/PartyMemberSlot" + str(i) + "/CardsLabel" + str(i))
		if cards_label:
			# You can set default cards info here
			pass

		var gear_label = get_node_or_null("HBoxContainer/PartyMemberSlot" + str(i) + "/GearLabel" + str(i))
		if gear_label:
			# You can set default gear info here
			pass


func _on_ready_button_pressed():
	print("Ready button pressed")
	# Transition to the dungeon map scene
	# get_tree().change_scene_to_file("res://scenes/DungeonMap.tscn")

# Placeholder functions for drag-and-drop card assignment
# In a real implementation, these would handle drag data
func _can_drop_data(position, data, member_index, card_slot_index):
	# Check if data is a card and can be dropped here
	return true # Placeholder

func _drop_data(position, data, member_index, card_slot_index):
	# Handle card drop, assign card to member
	# emit_signal("card_assigned", member_index, card_slot_index, data)
	print("Card dropped on member %d, slot %d" % [member_index, card_slot_index])

func gather_selected_party() -> Array:
	var result = []
	for panel in $PartyMembersContainer.get_children():
		var char_data = panel.character_data # each PartyMemberPanel exposes its CharacterData
		var assigned = panel.get_assigned_cards() # returns array of CardData
		result.append({ "character": char_data, "cards": assigned })
	return result
