extends Control

signal item_added(item)

func show_loot(items:Array):
    var grid = $Grid
    grid.queue_free_children()
    for item in items:
        var btn = Button.new()
        btn.text = str(item)
        grid.add_child(btn)
        btn.pressed.connect(func(): emit_signal("item_added", item))
