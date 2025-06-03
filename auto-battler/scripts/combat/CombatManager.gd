extends Node
class_name CombatManager

## Manages turn-based combat for the Survival Dungeon CCG Auto-Battler.
## Handles party and enemy combatants, turn order, and card usage.
## Emits signals for combat victory or defeat with results.

# Signal emitted when combat ends in victory
signal combat_victory(results: Dictionary)
# Signal emitted when combat ends in defeat
signal combat_defeat(results: Dictionary)

var party_members: Array[Combatant] = []  # Array of Combatant objects for the player's party
var enemies: Array[Combatant] = []        # Array of Combatant objects for the enemy side
var turn_order: Array[Combatant] = []     # Array of Combatant objects, sorted each round by speed

var _rng: RandomNumberGenerator = RandomNumberGenerator.new() # For RNG-based mechanics
var combat_log: Array[String] = [] # Log of combat events
var loot_gained: Array = []    # Loot obtained during this combat
var xp_gained: int = 0         # XP gained during this combat

# Inner class to represent a combatant (party member or enemy)
class Combatant:
    var source_data # Original data resource (e.g., PartyMemberResource, EnemyResource)
    var is_player_side: bool
    var assigned_cards: Array # Cards or abilities the combatant can use
    var current_hp: int
    # Combat-specific statuses (buffs, debuffs)
    var statuses: Dictionary = {}
    # Example: {"stunned": 1, "poisoned": 3} (value could be duration in turns)

    var card_play_index: int = 0 # Index for cycling through cards/abilities

    func _init(data_resource, is_player: bool):
        source_data = data_resource
        is_player_side = is_player
        # Ensure assigned_cards is always an array, even if empty
        var card_key = is_player ? "assigned_cards" : "abilities"
        assigned_cards = data_resource.get(card_key) ?? []
        current_hp = data_resource.get("base_hp") ?? 10 # Default to 10 HP if not specified
        # Note: Initial fatigue, hunger, thirst from source_data are not directly used by Combatant during combat itself.
        # They are more relevant for the PostBattleManager or overall GameManager.

    func get_next_card_to_play() -> Resource: # Assuming cards/abilities are resources
        if assigned_cards.is_empty():
            return null
        var card = assigned_cards[card_play_index]
        card_play_index = (card_play_index + 1) % assigned_cards.size()
        return card

    func get_name() -> String:
        var name_key = is_player_side ? "character_name" : "enemy_name"
        return source_data.get(name_key) ?? "Unknown Combatant"

func _ready() -> void:
    # Potential future use: Connect to UI signals if a combat UI scene is directly managed here.
    # For now, CombatManager is primarily logic-driven and controlled by GameManager.
    _rng.randomize()


## Initializes combat with party and enemy data.
func initialize_combat(initial_party_data: Array, enemy_encounter_data: Array) -> void:
    _log("Combat initializing...")
    _rng.randomize() # Ensure RNG is seeded for each combat

    # Reset combat state variables
    combat_log.clear()
    loot_gained.clear()
    xp_gained = 0
    party_members.clear()
    enemies.clear()
    turn_order.clear()

    # Create Combatant instances for party members
    for member_data in initial_party_data:
        if member_data: # Ensure data is not null
            party_members.append(Combatant.new(member_data, true))
        else:
            printerr("Null data encountered in initial_party_data")

    # Create Combatant instances for enemies
    # Future: Actual enemy instantiation might involve loading scenes or resources based on enemy_encounter_data
    for enemy_data in enemy_encounter_data:
        if enemy_data: # Ensure data is not null
            # Assuming enemy_encounter_data contains enemy resource paths or preloaded resources
            # For now, assume it's structured similarly to party_data with necessary fields
            enemies.append(Combatant.new(enemy_data, false))
        else:
            printerr("Null data encountered in enemy_encounter_data")

    _log("Combatants initialized. Party: %d, Enemies: %d" % [party_members.size(), enemies.size()])
    # Note: The actual auto-battle loop should be started by a separate call, e.g., from GameManager
    # run_auto_battle_loop() # This might be called externally after initialization


## Runs the main auto-battle loop until one side is defeated.
func run_auto_battle_loop() -> void:
    _log("Auto-battle loop started.")
    if party_members.is_empty() or enemies.is_empty():
        _log("Cannot start battle: one or both sides are empty.")
        # Determine if this is an immediate win/loss or an error
        _finalize_combat() # Will determine outcome based on empty sides
        return

    _build_turn_order() # Initial turn order

    var round_count = 0
    while not _is_side_defeated(party_members) and not _is_side_defeated(enemies):
        round_count += 1
        _log("--- Round %d ---" % round_count)
        if round_count > 50: # Safety break for excessively long battles
            _log("Battle exceeds 50 rounds, auto-terminating.")
            break

        for actor in turn_order:
            if _is_side_defeated(party_members) or _is_side_defeated(enemies):
                break # End round immediately if a side is defeated mid-round
            _process_actor_turn(actor)

        if not (_is_side_defeated(party_members) or _is_side_defeated(enemies)):
            _build_turn_order() # Rebuild turn order for the next round if combat continues

    _finalize_combat()


## Builds or rebuilds the turn order based on combatant speed and status.
func _build_turn_order() -> void:
    turn_order.clear()
    # Add living party members
    for combatant in party_members:
        if combatant.current_hp > 0:
            turn_order.append(combatant)
    # Add living enemies
    for combatant in enemies:
        if combatant.current_hp > 0:
            turn_order.append(combatant)

    # Shuffle for tie-breaking before sorting by speed
    # This ensures that if speeds are equal, the order is random.
    turn_order.shuffle()

    # Sort by speed (higher speed goes first)
    # Assumes combatants have a 'speed_modifier' or similar attribute in their source_data
    turn_order.sort_custom(func(a, b):
        return (a.source_data.get("speed_modifier") ?? 0) > (b.source_data.get("speed_modifier") ?? 0)
    )

    var turn_order_names = []
    for c in turn_order: turn_order_names.append(c.get_name())
    _log("Turn order: " + ", ".join(turn_order_names))


## Processes an individual actor's turn.
func _process_actor_turn(actor: Combatant) -> void:
    if actor.current_hp <= 0: # Actor might have been defeated before their turn
        return

    _log("Processing turn for: " + actor.get_name())

    # Status effect processing (e.g., DoTs, stun checks)
    # if _should_skip_turn_due_to_status(actor):
    #     _log(actor.get_name() + " is unable to act due to status effects.")
    #     return

    # AI Logic for card/ability and target selection would go here.
    # For players, this might be auto-control logic or input from a player controller.
    # For enemies, this is their AI decision-making process.
    var card_to_play = actor.get_next_card_to_play()

    if card_to_play == null:
        _log(actor.get_name() + " has no card/ability to use or chooses to pass.")
        return # Actor passes or has no valid action

    # Target selection logic
    # Placeholder: Simple targeting - enemies target players, players target enemies.
    # More complex logic would involve checking card's target type (single, multi, self, ally).
    var potential_targets = []
    if actor.is_player_side:
        potential_targets = _get_living_combatants(enemies)
    else:
        potential_targets = _get_living_combatants(party_members)

    if potential_targets.is_empty():
        var card_name = card_to_play.get("card_name") ?? "Unknown Card"
        _log(actor.get_name() + " has no valid targets for " + card_name)
        return

    # Select actual target(s) based on card properties and AI/rules
    # For now, assume single target, first valid target
    var actual_targets: Array[Combatant] = [potential_targets[0]]

    # Apply card effect
    # Placeholder: Call a method on the card resource itself, passing targets
    # _apply_card_effect(actor, card_to_play, actual_targets)
    var target_names: Array[String] = []
    for t in actual_targets:
        target_names.append(t.get_name())

    var play_name = card_to_play.get("card_name") ?? "a card"
    _log("%s uses %s on %s" % [
        actor.get_name(),
        play_name,
        ", ".join(target_names)
    ])
    # Detailed card effect resolution here (damage, healing, status application)
    # Example: Apply damage from card
    var damage = card_to_play.get("damage_amount") ?? (actor.source_data.get("base_attack") ?? 1)
    if damage > 0:
        for target_combatant in actual_targets:
            target_combatant.current_hp -= damage
            _log("%s takes %d damage. Current HP: %d" % [target_combatant.get_name(), damage, target_combatant.current_hp])
            if target_combatant.current_hp <= 0:
                _log(target_combatant.get_name() + " has been defeated.")
    _update_ui()


## Checks if all combatants on a given side are defeated.
func _is_side_defeated(side_combatants: Array[Combatant]) -> bool:
    if side_combatants.is_empty() and (side_combatants == party_members or side_combatants == enemies):
        # If checking an initially empty side (e.g. no enemies loaded), that side is effectively "defeated"
        # in the context of starting combat. However, during combat, an empty list means they were all defeated.
        # This logic might need refinement based on when this check is called relative to combat setup.
        # For now, if a side becomes empty during combat, it's defeated.
        return true
    for combatant in side_combatants:
        if combatant.current_hp > 0:
            return false # At least one combatant is still alive
    return true # All combatants are defeated or the side was empty


## Finalizes combat, determines outcome, and emits appropriate signal.
func _finalize_combat() -> void:
    var party_defeated = _is_side_defeated(party_members)
    var enemies_defeated = _is_side_defeated(enemies)
    var final_party_state = _get_final_party_state()
    _apply_survival_penalties()

    if party_defeated:
        _log("Party was defeated.")
        var results = {"final_party_state": final_party_state}
        emit_signal("combat_defeat", results)
    elif enemies_defeated:
        _log("Party is victorious!")
        _distribute_loot_and_xp() # Calculate loot and XP
        var results = {
            "loot": loot_gained,
            "xp_gained": xp_gained,
            "final_party_state": final_party_state
        }
        emit_signal("combat_victory", results)
    else:
        # This case (neither side defeated, e.g. from round limit) might be a draw or special scenario
        _log("Combat ended inconclusively (e.g., round limit reached).")
        # Consider if this should be a victory, defeat, or a new signal type (e.g., combat_draw)
        # For now, treating as a defeat if party isn't victorious.
        var results = {"final_party_state": final_party_state}
        emit_signal("combat_defeat", results) # Or a specific "combat_draw" signal


## Gathers the final state of party members (HP, statuses, etc.).
func _get_final_party_state() -> Array[Dictionary]:
    var final_state_array: Array[Dictionary] = []
    for member_combatant in party_members:
        var state = {
            "source_data_id": member_combatant.source_data.get("id") ?? "unknown_id", # Assuming source_data has an ID
            "current_hp": member_combatant.current_hp,
            "statuses": member_combatant.statuses.duplicate(true) # Deep copy statuses
            # Add other relevant data like remaining card uses, etc., if needed by PostBattleManager
        }
        final_state_array.append(state)
    return final_state_array


## Distributes loot and XP based on defeated enemies. (Placeholder)
func _distribute_loot_and_xp() -> void:
    # Simple loot and experience distribution placeholder
    loot_gained.clear()
    xp_gained = 0
    for enemy_combatant in enemies:
        # Only grant loot/XP if the enemy was actually defeated (though this function is called on victory)
        if enemy_combatant.current_hp <= 0:
            if enemy_combatant.source_data.has("loot_table"):
                for item_resource in enemy_combatant.source_data.loot_table:
                    loot_gained.append(item_resource) # Assuming items are resources
            xp_gained += enemy_combatant.source_data.get("xp_value") ?? 10 # Default 10 XP
    _log("Loot gained: %s, XP gained: %d" % [str(loot_gained.size()) + " items" if not loot_gained.is_empty() else "None", xp_gained])


## Helper to get living combatants from a list.
func _get_living_combatants(combatants_list: Array[Combatant]) -> Array[Combatant]:
    var living: Array[Combatant] = []
    for c in combatants_list:
        if c.current_hp > 0:
            living.append(c)
    return living


## Logs a message to the internal combat log and prints it.
func _log(message: String) -> void:
    combat_log.append(message)
    print("CombatManager: " + message) # Prefixing for clarity in console
    var scene = get_tree().current_scene
    if scene and scene.has_method("add_combat_log_entry"):
        scene.add_combat_log_entry(message)

func _update_ui() -> void:
    var scene = get_tree().current_scene
    if not scene:
        return
    if scene.has_method("update_party_display"):
        var party_state = []
        for c in party_members:
            party_state.append({"name": c.get_name(), "hp": c.current_hp})
        scene.update_party_display(party_state)
    if scene.has_method("update_enemy_display"):
        var enemy_state = []
        for e in enemies:
            enemy_state.append({"name": e.get_name(), "hp": e.current_hp})
        scene.update_enemy_display(enemy_state)

func _apply_survival_penalties() -> void:
    for member in party_members:
        if member.source_data:
            member.source_data.fatigue = (member.source_data.get("fatigue") ?? 0) + 1
            member.source_data.hunger = (member.source_data.get("hunger") ?? 0) + 1
            member.source_data.thirst = (member.source_data.get("thirst") ?? 0) + 1


# --- Functions to be removed or refactored from original ---
# Legacy TODO markers
# _show_post_battle_summary() -> Handled by UI / PostBattleManager
# _compare_speed() -> Integrated into _build_turn_order() lambda or static method if complex
# _get_name() -> Moved to Combatant class as get_name()
# _should_skip_turn(), _is_stunned(), _is_silenced(), _is_disabled() -> Part of _process_actor_turn status checks
# _get_valid_targets() -> Part of _process_actor_turn AI/targeting logic
# _compute_effect_modifier() -> Part of card effect resolution in _process_actor_turn
# _apply_card_effect() -> Main logic of _process_actor_turn
# _end_combat() -> Replaced by _finalize_combat()
# start_combat() -> Replaced by initialize_combat() and external call to run_auto_battle_loop()
# _run_battle() -> Renamed to run_auto_battle_loop()
# _process_turn() -> Refactored into _process_actor_turn()
