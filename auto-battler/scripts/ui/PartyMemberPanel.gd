extends PanelContainer

signal member_selected(member_data: Dictionary)
signal member_hovered(member_data: Dictionary)
signal member_unhovered(member_data: Dictionary)

@onready var name_label: Label = $VBoxContainer/NameLabel
@onready var portrait_texture: TextureRect = $VBoxContainer/PortraitTexture
@onready var hp_bar: ProgressBar = $VBoxContainer/HpBar
@onready var hp_label: Label = $VBoxContainer/HpBar/HpLabel # Path to the label inside progress bar
@onready var role_class_label: Label = $VBoxContainer/RoleClassLabel
@onready var status_effects_box: HBoxContainer = $VBoxContainer/StatusEffectsBox
@onready var fatigue_label: Label = $VBoxContainer/FatigueMeterLabel # Example

var member_data: Dictionary = {} : set = set_member_data

# Default texture for portraits (optional, adjust path as needed)
const DEFAULT_PORTRAIT_TEXTURE = preload("res://assets/portraits/default_portrait.png") # Ensure this path is valid or null

func _ready():
	if member_data:
		update_display()
	else:
		# Default placeholder state
		name_label.text = "Unknown Member"
		hp_bar.value = 0
		hp_label.text = "0/0"
		role_class_label.text = "N/A"
		fatigue_label.text = "Fatigue: -"
		portrait_texture.texture = DEFAULT_PORTRAIT_TEXTURE if DEFAULT_PORTRAIT_TEXTURE else null
		if DEFAULT_PORTRAIT_TEXTURE == null:
			portrait_texture.color = Color.DARK_GRAY

func set_member_data(new_data: Dictionary):
	member_data = new_data.duplicate(true) # Store a deep copy to avoid external modifications
	if is_inside_tree():
		update_display()

func update_display():
	if not member_data:
		name_label.text = "Data Error"
		return

	name_label.text = member_data.get("name", "N/A")

	var current_hp = member_data.get("hp", 0)
	var max_hp = member_data.get("max_hp", 100)
	if max_hp > 0:
		hp_bar.max_value = max_hp
		hp_bar.value = current_hp # ProgressBar clamps value automatically
		hp_label.text = "%d/%d" % [current_hp, max_hp]
	else: # Avoid division by zero or negative max_hp issues
		hp_bar.max_value = 1 # Still have a basis for the bar
		hp_bar.value = 0
		hp_label.text = "0/0"

	var role = member_data.get("role", "Role")
	var char_class = member_data.get("class", "Class")
	role_class_label.text = "%s / %s" % [role, char_class]

	var fatigue_val = member_data.get("fatigue", 0)
	var max_fatigue = member_data.get("max_fatigue", 100)
	if max_fatigue > 0: # Similar check for fatigue
		fatigue_label.text = "Fatigue: %d/%d" % [fatigue_val, max_fatigue]
	else:
		fatigue_label.text = "Fatigue: %d/-" % fatigue_val


	var portrait_path = member_data.get("portrait_path", "")
	if portrait_path and ResourceLoader.exists(portrait_path):
		portrait_texture.texture = load(portrait_path)
	else:
		if portrait_path:
			print_debug("Portrait not found at path: ", portrait_path)
		portrait_texture.texture = DEFAULT_PORTRAIT_TEXTURE if DEFAULT_PORTRAIT_TEXTURE else null
		if DEFAULT_PORTRAIT_TEXTURE == null and portrait_texture.texture == null:
			portrait_texture.color = Color.SLATE_GRAY


	clear_status_effects() # Clear old effects first
	var status_effects_list = member_data.get("status_effects", [])
	if status_effects_list is Array:
		for effect_data_or_id in status_effects_list:
			# Assuming effect_data_or_id could be a string ID or a Dictionary
			# You'd need a system to get full effect data (icon, tooltip) from an ID
			if effect_data_or_id is Dictionary:
				add_status_effect_icon(effect_data_or_id)
			# else if effect_data_or_id is String:
				# var full_effect_data = StatusEffectManager.get_effect_details(effect_data_or_id)
				# if full_effect_data: add_status_effect_icon(full_effect_data)

	# Handle KO status display
	if member_data.get("is_ko", false):
		self_modulate = Color(0.5, 0.5, 0.5, 0.8) # Dim if KO'd
		name_label.text += " (KO)" # Append KO, consider if name changes often
	else:
		self_modulate = Color.WHITE # Reset modulation


func _on_gui_input(event: InputEvent):
	if event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_LEFT and event.is_pressed():
			if not member_data.get("is_ko", false): # Optionally prevent selection if KO'd
				emit_signal("member_selected", member_data)
				print("Party member selected: ", member_data.get("name", "N/A"))
			else:
				print("Party member KO'd, selection ignored: ", member_data.get("name", "N/A"))


func _on_mouse_entered():
	if not member_data.get("is_ko", false): # Don't signal hover for KO'd members if not desired
		emit_signal("member_hovered", member_data)
		# Visual feedback, e.g., highlight
		# self.get_parent().get_node("HighlightRect").visible = true # Example if using a separate highlight node
		print("Party member hovered: ", member_data.get("name", "N/A"))


func _on_mouse_exited():
	if not member_data.get("is_ko", false):
		emit_signal("member_unhovered", member_data)
		# Revert visual feedback
		# if not member_data.get("is_ko", false): # Already checked above
		#    self.modulate = Color.WHITE # Be careful if other modulations are active (KO)
		print("Party member unhovered: ", member_data.get("name", "N/A"))

func clear_status_effects():
	for child in status_effects_box.get_children():
		child.queue_free()

func add_status_effect_icon(effect_data: Dictionary):
	var icon = TextureRect.new()
	icon.custom_minimum_size = Vector2(16,16) # Small icons
	icon.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	icon.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED

	var effect_icon_path = effect_data.get("icon_path", "res://assets/icons/default_status.png") # Default status icon
	if ResourceLoader.exists(effect_icon_path):
		icon.texture = load(effect_icon_path)
	else:
		icon.color = Color.PURPLE # Placeholder if icon missing
		print_debug("Status effect icon not found: ", effect_icon_path)

	icon.tooltip_text = effect_data.get("name", "Effect") + "\n" + effect_data.get("description", "No description.")
	status_effects_box.add_child(icon)

# Method to apply a temporary visual effect, e.g., when taking damage
func flash_effect(color: Color = Color.RED, duration: float = 0.2):
	var original_modulate = self_modulate # Store current modulate (e.g., if KO'd)
	var tween = create_tween()
	tween.set_parallel(true)
	tween.tween_property(self, "modulate", color, duration / 2.0)
	tween.tween_property(self, "modulate", original_modulate, duration / 2.0).set_delay(duration / 2.0)
	tween.play()
