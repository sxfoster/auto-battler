extends Node
class_name SceneLoader

## Loads a scene from the scenes directory by name.
static func goto_scene(scene_name: String) -> void:
    var path := "res://scenes/%s.tscn" % scene_name
    if ResourceLoader.exists(path):
        get_tree().change_scene_to_file(path)
    else:
        push_error("Scene not found: %s" % path)
