extends Node2D

signal node_selected(index)

var nodes := []

func _ready():
    _generate_nodes()

func _generate_nodes():
    var container = $MapContainer
    for i in range(5):
        var btn = Button.new()
        btn.text = "Room %d" % i
        btn.position = Vector2(i * 120, 0)
        container.add_child(btn)
        btn.pressed.connect(func(): emit_signal("node_selected", i))
        nodes.append(btn)
