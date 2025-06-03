extends Control

signal hovered
signal selected

var item

func set_item(p_item):
    item = p_item

func get_item():
    return item

func _unhandled_input(event):
    if event is InputEventMouseButton and event.pressed:
        emit_signal("selected")
    elif event is InputEventMouseMotion:
        emit_signal("hovered")
