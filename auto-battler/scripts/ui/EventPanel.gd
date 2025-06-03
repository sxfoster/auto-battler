extends PanelContainer

## Simple panel to display random events or traps.
signal event_resolved

@onready var description_label: Label = $VBoxContainer/DescriptionLabel
@onready var result_label: Label = $VBoxContainer/ResultLabel
@onready var confirm_button: Button = $VBoxContainer/ConfirmButton

var event_data: Dictionary = {}
var resolved: bool = false

func show_event(data: Dictionary) -> void:
    """Display an event description and optional skill check."""
    event_data = data
    description_label.text = data.get("description", "An event occurs.")
    result_label.text = ""
    confirm_button.text = "Attempt" if data.get("skill_check", false) else "Continue"

func _on_confirm_button_pressed() -> void:
    if not resolved and event_data.get("skill_check", false):
        _run_skill_check()
    else:
        emit_signal("event_resolved")
        queue_free()

func _run_skill_check() -> void:
    var dc := int(event_data.get("dc", 10))
    var roll := randi() % 20 + 1
    if roll >= dc:
        result_label.text = event_data.get("success_text", "Success!")
    else:
        result_label.text = event_data.get("fail_text", "Failure.")
    resolved = true
    confirm_button.text = "Continue"


