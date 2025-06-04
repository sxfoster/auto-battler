extends Control

# Signal emitted when an item is chosen to be added to inventory
signal add_item_to_inventory(item_data: Dictionary)
# Signal emitted when the panel is closed
signal loot_panel_closed

@export var loot_list_container_path: NodePath = NodePath("VBox/LootScroll/LootList")
@export var close_button_path: NodePath = NodePath("VBox/CloseButton")

@onready var loot_list_container: VBoxContainer = get_node(loot_list_container_path)
@onready var close_button: Button = get_node(close_button_path)

# Placeholder for loot items. In a real game, this would be passed to the panel.
var current_loot_items: Array = []

# Optional: Preload a scene for individual loot item entries if you make one
# var LootItemEntryScene = preload("res://scenes/ui_components/LootItemEntry.tscn")

func _ready():
        $CollectButton.connect("pressed", self, "_on_Collect_pressed")
	# Populate with some example loot if nothing is passed AND this panel is visible on start (for testing)
	# Typically, you'd call show_loot() from another script to display this panel.
	if current_loot_items.is_empty() and self.visible:
		# Rarity: 0=Common, 1=Uncommon, 2=Rare, 3=Epic
		set_loot_items([
			{"name": "Health Potion", "type": "consumable", "rarity": 0, "tags": ["Crafted by: Alchemist NPC"], "icon_path": "res://assets/icons/potion.png"}, # Example icon path
			{"name": "Iron Sword", "type": "gear", "rarity": 1, "tags": ["Found in dungeon"], "icon_path": "res://assets/icons/sword.png"},
			{"name": "Fireball Scroll", "type": "card", "rarity": 2, "tags": [], "icon_path": "res://assets/icons/scroll.png"}
		])
	elif !current_loot_items.is_empty():
		populate_loot_display()
	else:
		# If no items and not visible for testing, ensure it's clear
		clear_loot_display()


func set_loot_items(items: Array):
	current_loot_items = items.duplicate(true) # Store a deep copy
	populate_loot_display()

func clear_loot_display():
	for child in loot_list_container.get_children():
		child.queue_free()

func populate_loot_display():
	clear_loot_display() # Clear previous loot items

	if current_loot_items.is_empty():
		var empty_label = Label.new()
		empty_label.text = "No loot this time!"
		empty_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		loot_list_container.add_child(empty_label)
		close_button.text = "Close" # No items to take
		return
	else:
		close_button.text = "Close / Take All"


	for item_data in current_loot_items:
		# If using a LootItemEntryScene:
		# var item_entry = LootItemEntryScene.instantiate()
		# item_entry.set_item_data(item_data) # Assuming the scene script has this method
		# loot_list_container.add_child(item_entry)
		# var add_button_in_scene = item_entry.get_node_or_null("AddButton")
		# if add_button_in_scene:
		#    add_button_in_scene.pressed.connect(_on_add_item_button_pressed.bind(item_data, add_button_in_scene, item_entry))
		# item_entry.set_meta("item_data", item_data) # Store data for "Take All"

		# Create UI elements directly (similar to the .tscn example)
		var item_entry_hbox = HBoxContainer.new()
		item_entry_hbox.custom_minimum_size = Vector2(0, 50)
		item_entry_hbox.set_meta("item_data", item_data) # Store data for "Take All"

		var icon = TextureRect.new()
		icon.custom_minimum_size = Vector2(40,40)
		icon.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		icon.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		var icon_path = item_data.get("icon_path", "res://assets/icons/default_item.png") # Default icon
		var loaded_icon = load(icon_path) # In real game, handle load errors
		if loaded_icon:
			icon.texture = loaded_icon
		else:
			# Could set a placeholder color or default texture if load fails
			icon.color = Color(0.6, 0.6, 0.6, 1) # Placeholder color if icon not found
		item_entry_hbox.add_child(icon)

		var details_vbox = VBoxContainer.new()
		details_vbox.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		item_entry_hbox.add_child(details_vbox)

		var name_label = Label.new()
		var rarity_str = get_rarity_string(item_data.get("rarity", 0))
		name_label.text = "%s (%s)" % [item_data.get("name", "Unknown Item"), rarity_str]
		details_vbox.add_child(name_label)

		var tags_label = Label.new()
		var tags_array = item_data.get("tags", [])
		if tags_array is Array and not tags_array.is_empty():
			tags_label.text = ", ".join(tags_array)
		else:
			tags_label.text = "" # Hide if no tags, or "No special tags"
			tags_label.visible = false
		tags_label.add_theme_font_size_override("font_size", 12)
		details_vbox.add_child(tags_label)

		var add_button = Button.new()
		add_button.text = "Add" # Shorter text
		add_button.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		add_button.pressed.connect(_on_add_item_button_pressed.bind(item_data, add_button, item_entry_hbox))
		item_entry_hbox.add_child(add_button)

		loot_list_container.add_child(item_entry_hbox)

func get_rarity_string(rarity_val: int) -> String:
	match rarity_val:
		0: return "Common"
		1: return "Uncommon"
		2: return "Rare"
		3: return "Epic"
		_: return "Unknown Rarity"

func _on_add_item_button_pressed(item_data: Dictionary, button_node: Button, item_entry_node: HBoxContainer):
	print("Add to inventory button pressed for: ", item_data.name)
	emit_signal("add_item_to_inventory", item_data)

	button_node.disabled = true
	button_node.text = "Added"
	# item_entry_node.modulate = Color(0.7, 0.7, 0.7, 0.5) # Dim it slightly and make transparent

func _on_close_button_pressed():
	print("Close button pressed on Loot Panel")
	# "Take All" functionality: iterate through items not yet added and add them.
	for child_node in loot_list_container.get_children():
		if child_node is HBoxContainer: # Assuming HBoxContainer is an item entry
			var add_button = child_node.find_child("Button", true, false) # Find the button more reliably
			if add_button and add_button is Button and not add_button.disabled:
				var item_data_from_node = child_node.get_meta("item_data", null)
				if item_data_from_node:
					emit_signal("add_item_to_inventory", item_data_from_node)
					print("Auto-adding on close: ", item_data_from_node.name)
					add_button.disabled = true # Visually mark as added
					add_button.text = "Added"

	emit_signal("loot_panel_closed")
	# It's often better for the parent/manager of this panel to hide or queue_free it.
	# This allows for pooling or re-showing. For now, queue_free.
	queue_free()

# Call this method to show the loot panel with specific items
func show_loot(items_to_display: Array):
	set_loot_items(items_to_display)
	self.visible = true
	# Optional: Bring to front if it's part of a complex UI
	# move_to_front()

func _on_Collect_pressed():
        GameManager.change_to_dungeon_map()
