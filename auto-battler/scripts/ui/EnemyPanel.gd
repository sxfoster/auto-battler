extends PanelContainer

signal enemy_selected(enemy_data: Dictionary)  # E.g., for targeting intent or info display
signal enemy_hovered(enemy_data: Dictionary)
signal enemy_unhovered(enemy_data: Dictionary)

@onready var name_label: Label = $VBoxContainer/NameLabel
@onready var sprite_texture: TextureRect = $VBoxContainer/SpriteTexture
@onready var hp_bar: ProgressBar = $VBoxContainer/HpBar
@onready var hp_label: Label = $VBoxContainer/HpBar/HpLabel
@onready var status_effects_box: HBoxContainer = $VBoxContainer/StatusEffectsBox

var enemy_data: Dictionary = {}:
	set = set_enemy_data

# Default texture for enemy sprites (optional, adjust path as needed)
const DEFAULT_SPRITE_TEXTURE = preload("res://assets/portraits/default_portrait.png")  # Placeholder: Fallback to default portrait for missing enemy sprite


func _ready():
	if enemy_data:
		update_display()
	else:
		name_label.text = "Unknown Enemy"
		hp_bar.value = 0
		hp_label.text = "0/0"
		sprite_texture.texture = DEFAULT_SPRITE_TEXTURE if DEFAULT_SPRITE_TEXTURE else null
		if DEFAULT_SPRITE_TEXTURE == null:
			sprite_texture.color = Color.DARK_RED  # Fallback color


func set_enemy_data(new_data: Dictionary):
	enemy_data = new_data.duplicate(true)  # Store a deep copy
	if is_inside_tree():
		update_display()


func update_display():
	if not enemy_data:
		name_label.text = "Data Error"
		return

	name_label.text = enemy_data.get("name", "N/A")

	var current_hp = enemy_data.get("hp", 0)
	var max_hp = enemy_data.get("max_hp", 100)
	if max_hp > 0:
		hp_bar.max_value = max_hp
		hp_bar.value = current_hp
		hp_label.text = "%d/%d" % [current_hp, max_hp]
	else:
		hp_bar.max_value = 1
		hp_bar.value = 0
		hp_label.text = "0/0"

	var sprite_path = enemy_data.get("sprite_path", "")
	if sprite_path and ResourceLoader.exists(sprite_path):
		sprite_texture.texture = load(sprite_path)
	else:
		if sprite_path:
			print_debug("Enemy sprite not found at path: ", sprite_path)
		sprite_texture.texture = DEFAULT_SPRITE_TEXTURE if DEFAULT_SPRITE_TEXTURE else null
		if DEFAULT_SPRITE_TEXTURE == null and sprite_texture.texture == null:
			sprite_texture.color = Color.MAROON

	clear_status_effects()
	var status_effects_list = enemy_data.get("status_effects", [])
	if status_effects_list is Array:
		for effect_data_or_id in status_effects_list:
			if effect_data_or_id is Dictionary:
				add_status_effect_icon(effect_data_or_id)
			# else if effect_data_or_id is String: # Extend with manager lookup if using IDs
			# var full_effect_data = StatusEffectManager.get_effect_details(effect_data_or_id)
			# if full_effect_data: add_status_effect_icon(full_effect_data)

	if enemy_data.get("is_ko", false):
		self_modulate = Color(0.5, 0.5, 0.5, 0.7)  # Dim if KO'd
		name_label.text += " (Defeated)"  # Consider if name changes often
	else:
		self_modulate = Color.WHITE


func _on_gui_input(event: InputEvent):
	if event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_LEFT and event.is_pressed():
			if not enemy_data.get("is_ko", false):
				emit_signal("enemy_selected", enemy_data)
				print("Enemy selected: ", enemy_data.get("name", "N/A"))
			else:
				print("Enemy defeated, selection ignored: ", enemy_data.get("name", "N/A"))


func _on_mouse_entered():
	if not enemy_data.get("is_ko", false):
		emit_signal("enemy_hovered", enemy_data)
		# Visual feedback (e.g., outline or slight scale)
		print("Enemy hovered: ", enemy_data.get("name", "N/A"))


func _on_mouse_exited():
	if not enemy_data.get("is_ko", false):
		emit_signal("enemy_unhovered", enemy_data)
		# Revert visual feedback
		print("Enemy unhovered: ", enemy_data.get("name", "N/A"))


func clear_status_effects():
	for child in status_effects_box.get_children():
		child.queue_free()


func add_status_effect_icon(effect_data: Dictionary):
	var icon = TextureRect.new()
	icon.custom_minimum_size = Vector2(16, 16)  # Small icons
	icon.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	icon.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED

	var effect_icon_path = effect_data.get("icon_path", "res://assets/icons/default_status.png")  # Default status icon
	if ResourceLoader.exists(effect_icon_path):
		icon.texture = load(effect_icon_path)
	else:
		icon.color = Color.PURPLE  # Placeholder if icon missing
		print_debug("Status effect icon not found for enemy: ", effect_icon_path)

	icon.tooltip_text = (
		effect_data.get("name", "Effect") + "\n" + effect_data.get("description", "No description.")
	)
	status_effects_box.add_child(icon)


# Method to apply a temporary visual effect, e.g., when taking damage
func flash_effect(color: Color = Color.RED, duration: float = 0.2):
	var original_modulate = self_modulate
	var tween = create_tween()
	tween.set_parallel(true)
	tween.tween_property(self, "modulate", color, duration / 2.0)
	tween.tween_property(self, "modulate", original_modulate, duration / 2.0).set_delay(
		duration / 2.0
	)
	tween.play()
