extends PanelContainer

signal card_hovered(card_data: Dictionary)
signal card_unhovered(card_data: Dictionary)
signal card_selected(card_data: Dictionary) # For click/tap

@onready var name_label: Label = $VBoxContainer/CardNameLabel
@onready var art_texture: TextureRect = $VBoxContainer/CardArtTexture
@onready var description_label: Label = $VBoxContainer/CardDescriptionLabel
@onready var cost_label: Label = $VBoxContainer/CardCostLabel

var card_data: Dictionary = {} : set = set_card_data # Store the card's data

# Default texture for when card art is missing
const DEFAULT_ART_TEXTURE = preload("res://assets/portraits/default_portrait.png") # Fallback to default portrait

func _ready():
	# Default appearance or based on initial card_data if set
	if card_data:
		update_display()
	else:
		# Set to some default placeholder state if no data yet
		name_label.text = "No Card"
		description_label.text = "This card has no data."
		cost_label.text = "Cost: -"
		art_texture.texture = DEFAULT_ART_TEXTURE if DEFAULT_ART_TEXTURE else null
		if DEFAULT_ART_TEXTURE == null:
			art_texture.color = Color.DARK_GRAY # Fallback color if default art also missing

func set_card_data(new_card_data: Dictionary):
	card_data = new_card_data
	if is_inside_tree(): # Ensure nodes are ready
		update_display()

func update_display():
	if not card_data: # Should not happen if setter is used properly, but good check
		name_label.text = "Card Data Error"
		description_label.text = "Invalid card data."
		cost_label.text = "Cost: ERR"
		art_texture.texture = DEFAULT_ART_TEXTURE if DEFAULT_ART_TEXTURE else null
		if DEFAULT_ART_TEXTURE == null:
			art_texture.color = Color.RED
		return

	name_label.text = card_data.get("name", "Unnamed Card")
	description_label.text = card_data.get("description", "No description available.")
	cost_label.text = "Cost: %s" % card_data.get("cost", "-")

	var art_path = card_data.get("art_path", "")
	if art_path and ResourceLoader.exists(art_path):
		art_texture.texture = load(art_path)
	else:
		if art_path: # If path was provided but not found
			print_debug("Card art not found at path: ", art_path)
		art_texture.texture = DEFAULT_ART_TEXTURE if DEFAULT_ART_TEXTURE else null
		if DEFAULT_ART_TEXTURE == null and art_texture.texture == null : # Check again in case DEFAULT_ART_TEXTURE was null
			art_texture.color = Color.SLATE_GRAY # Fallback color if default art also missing and no texture set

func _on_gui_input(event: InputEvent):
	if event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_LEFT and event.is_pressed(): # use is_pressed() for down click
			emit_signal("card_selected", card_data)
			# Optional: Add visual feedback for selection, e.g., a short animation or border change
			# Example: create_tween().tween_property(self, "scale", Vector2(1.1, 1.1), 0.1).chain().tween_property(self, "scale", Vector2(1.0, 1.0), 0.1)
			print("Card selected: ", card_data.get("name", "N/A"))

func _on_mouse_entered():
	emit_signal("card_hovered", card_data)
	# Optional: Add visual feedback for hover, e.g., scale up, highlight border
	# create_tween().tween_property(self, "modulate", Color(0.9, 0.9, 1.1), 0.1) # Slight tint
	print("Card hovered: ", card_data.get("name", "N/A"))


func _on_mouse_exited():
	emit_signal("card_unhovered", card_data)
	# Optional: Revert visual feedback for hover
	# create_tween().tween_property(self, "modulate", Color(1,1,1), 0.1) # Reset tint
	print("Card unhovered: ", card_data.get("name", "N/A"))

# Public method to allow external highlighting (e.g., if it's the "current turn" card)
func set_highlight(is_highlighted: bool):
	if is_highlighted:
		self_modulate = Color.GOLD # Example highlight color
	else:
		self_modulate = Color.WHITE # Default modulate (ensure no conflict with KO state etc. if used elsewhere)
