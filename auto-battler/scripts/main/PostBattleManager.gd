# PostBattleManager.gd
# Handles the phase immediately after combat, applying effects,
# distributing rewards, and determining the next game state transition.

extends Node
class_name PostBattleManager

# Emitted after all post-battle effects and updates are applied.
# The receiving manager (likely GameManager) can then decide the next actual scene/state.
signal post_battle_processing_complete(final_party_state: Array, rewards_summary: Dictionary)

# Signals to indicate the suggested next transition, if this manager has enough context.
# Alternatively, GameManager can make this decision based on the processing_complete signal's data.
signal transition_to_map_requested
signal transition_to_rest_requested
signal transition_to_game_over_requested # e.g. if party wiped and it's a full exit

# Variables to hold data passed from combat
var battle_outcome: Dictionary = {} # Stores {victory: bool, loot: Array, xp_gained: int, final_party_state_from_combat: Array}
var party_data_before_post_battle: Array = [] # The state of the party as it entered post-battle

func _ready() -> void:
    print("PostBattleManager: Ready.")

# Called by GameManager to start post-battle processing.
# - combat_results: Dictionary from CombatManager (e.g., {victory: bool, loot: Array, xp: int, final_party_state: Array})
# - current_party_state_before_effects: The full party state before these post-battle effects are applied.
func initialize_post_battle(combat_results: Dictionary, current_party_state_before_effects: Array) -> void:
    print("PostBattleManager: Initializing with combat results.")
    battle_outcome = combat_results
    party_data_before_post_battle = current_party_state_before_effects.duplicate(true) # Make a deep copy to modify

    # Apply all effects and updates
    var final_party_state = _apply_all_post_battle_effects()
    var rewards_summary = _prepare_rewards_summary()

    # Emit a general signal that processing is done. GameManager can use this.
    emit_signal("post_battle_processing_complete", final_party_state, rewards_summary)

    # Then, suggest a transition (optional, could be handled by GameManager)
    _determine_next_transition(final_party_state)


# Main function to orchestrate all post-battle updates
func _apply_all_post_battle_effects() -> Array:
    var updated_party_state = party_data_before_post_battle

    if battle_outcome.get("victory", false):
        # Apply survival penalties only on victory (as per typical game loops)
        updated_party_state = _update_fatigue_hunger_thirst(updated_party_state)

        # Distribute XP (actual XP application to characters would happen here or be noted for GameManager)
        _distribute_xp(battle_outcome.get("xp_gained", 0), updated_party_state)

        # Update inventory with loot
        _update_inventory(battle_outcome.get("loot", []), updated_party_state) # This might update a global inventory via GameManager
    else:
        # Handle defeat specific effects if any (e.g., more severe penalties, item loss - not specified)
        print("PostBattleManager: Processing defeat.")

    # Apply any other general effects that happen regardless of victory/defeat (e.g. quest updates - not specified)

    # Ensure the party state from combat (HP, statuses) is correctly merged/used.
    # The `final_party_state_from_combat` has the most current HP/statuses from CombatManager.
    # We need to merge this with the party data that includes fatigue/hunger/thirst.
    var combat_end_party_state = battle_outcome.get("final_party_state_from_combat", [])
    updated_party_state = _merge_combat_and_survival_states(combat_end_party_state, updated_party_state)

    print("PostBattleManager: Post-battle effects applied.")
    return updated_party_state

# Helper to merge HP/statuses from combat outcome with fatigue/hunger/thirst from survival updates
func _merge_combat_and_survival_states(combat_state: Array, survival_state: Array) -> Array:
    var final_state = []
    for i in range(survival_state.size()):
        var member_survival_data = survival_state[i].duplicate(true) # Start with survival data (fatigue, etc.)
        if i < combat_state.size():
            var member_combat_data = combat_state[i] # HP, statuses from combat
            member_survival_data["hp"] = member_combat_data.get("current_hp", member_survival_data.get("hp", 0))
            member_survival_data["statuses"] = member_combat_data.get("statuses", member_survival_data.get("statuses", {}))
        final_state.append(member_survival_data)
    return final_state

# Stub for updating fatigue, hunger, and thirst.
func _update_fatigue_hunger_thirst(party_state_array: Array) -> Array:
    # Future implementation:
    # Iterate through party_state_array, access each member's data (Dictionary).
    # Increment fatigue, hunger, thirst based on game rules.
    # Example: member_data["fatigue"] = member_data.get("fatigue", 0) + 5
    print("PostBattleManager: Updating fatigue, hunger, thirst (stub).")
    for member_data in party_state_array:
        member_data["fatigue"] = member_data.get("fatigue", 0) + 1 # Example increment
        member_data["hunger"] = member_data.get("hunger", 0) + 1   # Example increment
        member_data["thirst"] = member_data.get("thirst", 0) + 1   # Example increment
    return party_state_array

# Stub for distributing XP.
func _distribute_xp(xp_amount: int, party_state_array: Array) -> void:
    # Future implementation:
    # Logic to divide xp_amount among party_state_array members.
    # This might update "xp" and "level" fields in each member_data.
    # For now, just logs. GameManager might handle actual XP application.
    print("PostBattleManager: Distributing %s XP to party (stub)." % xp_amount)
    if not party_state_array.is_empty():
        var xp_per_member = xp_amount / party_state_array.size() if party_state_array.size() > 0 else 0
        for member_data in party_state_array:
            member_data["xp"] = member_data.get("xp", 0) + xp_per_member
    pass

# Stub for updating the player's inventory with new items.
func _update_inventory(loot_array: Array, party_state_array: Array) -> void:
    # Future implementation:
    # Add items from loot_array to the global inventory (likely managed by GameManager).
    # This function might receive a reference to the inventory or emit a signal.
    print("PostBattleManager: Updating inventory with loot (stub): %s" % str(loot_array))
    # Example: GameManager.add_items_to_inventory(loot_array)
    pass

# Prepares a summary of rewards for UI display or logging.
func _prepare_rewards_summary() -> Dictionary:
    var summary = {
        "xp_gained": battle_outcome.get("xp_gained", 0),
        "loot_received": battle_outcome.get("loot", [])
    }
    print("PostBattleManager: Rewards summary prepared.")
    return summary

# Stub for determining the next transition based on game state.
func _determine_next_transition(final_party_state: Array) -> void:
    # Future implementation:
    # Logic to decide if the game continues to map, rest, or ends.
    # This could depend on party wipe, dungeon depth, specific events, player choice.
    # For now, assumes victory leads to map, defeat to game over.

    # Check for party wipe
    var all_defeated = true
    for member_data in final_party_state:
        if member_data.get("hp", 0) > 0:
            all_defeated = false
            break

    if all_defeated:
        print("PostBattleManager: Party wiped. Requesting game over.")
        emit_signal("transition_to_game_over_requested")
    elif battle_outcome.get("victory", false):
        print("PostBattleManager: Victory. Requesting transition to map.")
        # Potentially, a choice could be offered: map or rest.
        # For now, directly to map.
        emit_signal("transition_to_map_requested")
    else: # Defeat, but not a full party wipe (edge case, or depends on game rules)
        print("PostBattleManager: Defeat (not full wipe). Requesting game over for now.")
        # This state might lead to a "limp back to town" or other scenario.
        emit_signal("transition_to_game_over_requested")
    pass
