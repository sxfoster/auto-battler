extends Control

signal craft_requested(items)

func _ready():
    $CraftButton.pressed.connect(_on_craft_pressed)

func _on_craft_pressed():
    var items: Array = []
    for child in $Pouch.get_children():
        if child.has_method("get_item"):
            var item = child.get_item()
            if item != null:
                items.append(item)
    emit_signal("craft_requested", items)
