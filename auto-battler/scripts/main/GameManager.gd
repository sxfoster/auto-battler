extends Node
class_name GameManager

## Manages global game state and scene transitions for the encounter loop.
## Tracks the party, inventory and dungeon progress and moves between scenes
## after combat, loot/event and rest phases.

signal encounter_phase_changed(new_phase)

enum EncounterPhase {
    COMBAT,
    LOOT_EVENT,
    REST
}

var party: Array = []              ## Array[CharacterData]
var inventory: Array = []          ## Array[CardData]
var dungeon_progress: int = 0

var current_phase: EncounterPhase = EncounterPhase.COMBAT

func _ready() -> void:
    ## Start at the main menu if launched directly.
    if Engine.is_editor_hint():
        return
    if get_tree().current_scene == null:
        goto_phase(EncounterPhase.COMBAT)

func start_new_run(party_members: Array) -> void:
    ## Initializes a new dungeon run with the given party members.
    party = party_members
    inventory.clear()
    dungeon_progress = 0
    goto_phase(EncounterPhase.COMBAT)

func goto_phase(phase: EncounterPhase) -> void:
    current_phase = phase
    emit_signal("encounter_phase_changed", phase)
    match phase:
        EncounterPhase.COMBAT:
            change_scene("res://auto-battler/scenes/CombatScene.tscn")
        EncounterPhase.LOOT_EVENT:
            change_scene("res://auto-battler/scenes/DungeonMap.tscn")
        EncounterPhase.REST:
            change_scene("res://auto-battler/scenes/RestScene.tscn")

func change_scene(scene_path: String) -> void:
    if get_tree().current_scene:
        get_tree().current_scene.free()
    var scene = load(scene_path)
    var inst = scene.instantiate()
    get_tree().root.add_child(inst)
    get_tree().current_scene = inst

func on_combat_finished(victory: bool) -> void:
    ## Called by CombatScene when battle ends.
    if victory:
        dungeon_progress += 1
    goto_phase(EncounterPhase.LOOT_EVENT)

func on_loot_complete() -> void:
    ## Called when loot or event phase is done.
    goto_phase(EncounterPhase.REST)

func on_rest_complete() -> void:
    ## Called after resting before returning to combat.
    goto_phase(EncounterPhase.COMBAT)
