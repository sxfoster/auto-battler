extends Control

# Signal for when an item is crafted
signal item_crafted(item_data, ingredients_used)

@onready var inventory_grid: GridContainer = $MainHBox/InventoryPanel/InventoryGrid
@onready var crafting_slots_container: HBoxContainer = $MainHBox/CraftingPanel/CraftingSlots
@onready var profession_label: Label = $MainHBox/CraftingPanel/ProfessionLabel
@onready var known_recipes_label: Label = $MainHBox/CraftingPanel/KnownRecipesLabel
@onready var crafting_preview_label: Label = $MainHBox/CraftingPanel/CraftingPreviewLabel
@onready var crafting_log_label: Label = $MainHBox/CraftingPanel/CraftingLogLabel

var inventory_items = [] # Array to hold actual inventory item data
var crafting_slot_items = [null, null, null, null, null] # Items in crafting slots

func _ready():
	# Initialize inventory display (placeholder)
	# For now, using static items in scene, but you'd populate this from InventorySystem
	# Example: populate_inventory_display()

	# Initialize crafting slots (e.g., set them as drop targets)
	# For now, this is conceptual. Drag-and-drop setup is more involved.
	update_crafting_slots_display()
	update_profession_display()
	update_known_recipes_display()
	update_crafting_preview() # Initially empty or based on default selection

func _on_craft_button_pressed():
	print("Craft button pressed")
	# 1. Check items in crafting_slot_items
	# 2. Determine if a valid recipe matches
	# 3. If yes, "craft" the item (e.g., remove ingredients, add result to inventory)
	# 4. Emit item_crafted signal
	# 5. Update inventory and crafting displays
	# For now, a placeholder log:
	var ingredients = []
	var ingredient_names = [] # For logging
	for item in crafting_slot_items:
		if item != null: # Assuming item is some data structure or string
			ingredients.append(item)
			if item is Dictionary and item.has("name"):
				ingredient_names.append(item.name)
			else:
				ingredient_names.append(str(item)) # Fallback to string representation

	if ingredients.size() > 0:
		# Simulate finding a recipe
		var crafted_item_name = "Simulated Crafted Item" # Replace with actual recipe logic
		# In a real system, you'd look up a recipe based on 'ingredients'
		# var recipe = RecipeManager.find_recipe(ingredients)
		# if recipe:
		#    crafted_item_name = recipe.result_item_name
		#    emit_signal("item_crafted", recipe.result_item_data, ingredients)
		#    # Remove ingredients from inventory_items
		#    # Add crafted_item_data to inventory_items
		# else:
		#    add_crafting_log("No recipe found for: " + str(ingredient_names))
		#    return

		add_crafting_log("Attempting to craft with: " + str(ingredient_names))
		add_crafting_log("Success! Crafted: " + crafted_item_name)
		# Example: emit_signal("item_crafted", {"name": crafted_item_name, "id": "sim_craft_01"}, ingredients)

		# Clear crafting slots
		for i in range(crafting_slot_items.size()):
			crafting_slot_items[i] = null
		update_crafting_slots_display()
		update_crafting_preview() # Clear or update preview
		# populate_inventory_display() # Refresh inventory display
	else:
		add_crafting_log("No items in crafting pouch.")

func add_crafting_log(log_text: String):
	crafting_log_label.text = log_text # Simple log, could be appended to a list or VBoxContainer of Labels
	print("Crafting Log: ", log_text)

# Placeholder functions for updating different parts of the UI
func populate_inventory_display():
	# Clear existing items
	for child in inventory_grid.get_children():
		child.queue_free()
	# Add items from inventory_items (this requires item data and a scene for item display)
	# For each item_data in inventory_items:
	#   var item_ui_instance = load("res://scenes/ui_components/InventoryItemUI.tscn").instantiate() # Example path
	#   item_ui_instance.set_item_data(item_data) # A function you'd define in InventoryItemUI.gd
	#   inventory_grid.add_child(item_ui_instance)
	#   # Connect drag signals for item_ui_instance here or in its own script
	pass

func update_crafting_slots_display():
	var slots = crafting_slots_container.get_children()
	for i in range(min(slots.size(), crafting_slot_items.size())):
		var slot_node = slots[i]
		var label = slot_node.get_node_or_null("Label")
		if label:
			if crafting_slot_items[i] != null:
				var item = crafting_slot_items[i]
				if item is Dictionary and item.has("name"):
					label.text = item.name
				else:
					label.text = str(item) # Fallback
			else:
				label.text = "[Empty]"
		# Setup _can_drop_data and _drop_data for each slot_node to receive items
		# This would typically be done by assigning a script to each slot or handling it here
		# For example, slot_node.set_script(load("res://scripts/ui_components/CraftingSlotDropTarget.gd"))
		# Or connect signals: slot_node.gui_input.connect(Callable(self, "_on_slot_gui_input").bind(i))


func update_profession_display(prof_name: String = "Herbalism", level: int = 1):
	profession_label.text = "Profession: %s Lvl %d" % [prof_name, level]

func update_known_recipes_display(recipes: Array = ["Healing Salve", "Stamina Draught"]):
	var recipe_text = "Recipes: "
	if recipes.size() > 0:
		recipe_text += ", ".join(recipes)
	else:
		recipe_text += "None known"
	known_recipes_label.text = recipe_text

func update_crafting_preview():
	# This would look at items in crafting_slot_items and check known recipes
	var preview_text = "Output Preview: "
	# var recipe_result = RecipeManager.check_recipe(crafting_slot_items) # Example
	# if recipe_result:
	#    preview_text += recipe_result.name # Assuming recipe_result has a name property
	# else:
	preview_text += "---"
	crafting_preview_label.text = preview_text


# --- Drag and Drop Handling (Conceptual) ---
# Each inventory item needs to be draggable.
# Each crafting slot needs to be a drop target.

# This function would be connected to the 'gui_input' signal of each crafting slot.
# You'd need to iterate through slots in _ready and connect them.
func _on_slot_gui_input(event: InputEvent, slot_index: int):
	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT and event.pressed:
		# Example: Clicking a slot could try to move an item back to inventory or clear it
		# print("Clicked slot ", slot_index, " containing ", crafting_slot_items[slot_index])
		# if crafting_slot_items[slot_index] != null:
		#    # Add item back to inventory_items
		#    # inventory_items.append(crafting_slot_items[slot_index])
		#    crafting_slot_items[slot_index] = null
		#    update_crafting_slots_display()
		#    update_crafting_preview()
		#    # populate_inventory_display() # Refresh inventory
		pass

# For actual drag and drop, each crafting slot (PanelContainer) should have a script
# or this main script should handle their _can_drop_data and _drop_data methods.
# If handled here, you would need to get the specific slot that is being targeted.
# Godot's drag and drop system usually involves connecting signals on the controls themselves.

# Example for a crafting slot (if it had its own script, or part of this main script):
# func _can_drop_data(position, data): # position is local to the control
#    # Assuming 'data' is a dictionary like: {"type": "inventory_item", "item_data": {...}}
#    return data is Dictionary and data.has("type") and data.type == "inventory_item"

# func _drop_data(position, data):
#    var slot_index = get_index() # Or some other way to identify which slot this is
#    crafting_slot_items[slot_index] = data.item_data
#    # Remove from original source (e.g., inventory_grid or another crafting_slot)
#    # This part is complex as you need to know where it came from.
#    # Often, the drag data includes a reference to the source.
#    update_crafting_slots_display()
#    update_crafting_preview()


# Example for an inventory item UI element (script on the item's scene):
# func _get_drag_data(position):
#   var preview_control = Label.new() # Or a more complex preview scene instance
#   preview_control.text = self.item_data.name
#   set_drag_preview(preview_control)
#   return {"type": "inventory_item", "item_data": self.item_data, "source_inventory_index": self.inventory_slot_index}
#
# When an item is dropped onto a crafting slot, the slot's _drop_data would:
# 1. Store item_data in its corresponding crafting_slot_items[slot_index].
# 2. Potentially tell an InventoryManager to remove the item from source_inventory_index.
#
# If an item is dragged FROM a crafting slot, its _get_drag_data would be:
# return {"type": "crafting_slot_item", "item_data": self.item_data, "source_crafting_slot_index": self.slot_index}
# And if dropped on another crafting slot, that slot would clear crafting_slot_items[source_crafting_slot_index].
# If dropped back onto the inventory grid, the grid's _drop_data would handle adding it back.
#
# This level of detail for drag and drop is typically handled by dedicated scripts on the draggable items
# and drop target areas, or a more centralized drag-and-drop manager.
# The functions here are mostly placeholders for that logic.
