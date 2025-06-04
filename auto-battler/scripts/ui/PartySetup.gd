extends Control

# Signals for card assignment (placeholders)
signal card_assigned(member_index, card_slot, card_data)
signal gear_equipped(member_index, gear_slot, gear_data)

func _ready():
        # Initialize party member slots (e.g., load character data)
        # For now, we'll use placeholders
        for i in range(1, 6):
                var base_path = "ContentContainer/MainVBox/MembersGrid/MemberPanel" + str(i) + "/MemberVBox"
                var name_label = get_node_or_null(base_path + "/NameLabel")
                if name_label:
                        name_label.text = "Member " + str(i)

                # Additional labels can be initialized here if needed

        if has_node("ContentContainer/MainVBox/ConfirmPartyButton"):
                $ConfirmPartyButton.pressed.connect(_on_confirm_party)

func _on_confirm_party():
        SceneLoader.goto_scene("PreparationScene")

# Placeholder functions for drag-and-drop card assignment
# In a real implementation, these would handle drag data
func _can_drop_data(position: Vector2, data) -> bool:
	# Check if data is a card and can be dropped here
	return true # Placeholder

func _drop_data(position: Vector2, data) -> void:
	# Handle card drop, assign card to member
	print("Card dropped: %s" % [str(data)])
