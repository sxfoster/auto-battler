extends Node
class_name CombatManager

## Manages turn-based combat for the Survival Dungeon CCG Auto-Battler.
## Handles party and enemy combatants, turn order, card usage, and
## post-battle survival updates.

signal combat_finished(victory: bool)

var party_members: Array = []  ## Array[Combatant]
var enemies: Array = []        ## Array[Combatant]
var turn_order: Array = []     ## Array[Combatant] sorted each round

var _rng: RandomNumberGenerator = RandomNumberGenerator.new()
var combat_log: Array = []
var loot_gained: Array = []
var xp_gained: int = 0

class Combatant:
    var data
    var is_player: bool
    var assigned_cards: Array
    var current_hp: int
    var fatigue: int
    var hunger: int
    var thirst: int
    var card_index: int = 0
    var statuses := {}

    func _init(d, player: bool):
        data = d
        is_player = player
        assigned_cards = d.assigned_cards if player else d.abilities
        current_hp = d.base_hp
        fatigue = d.fatigue if player else 0
        hunger = d.hunger if player else 0
        thirst = d.thirst if player else 0

    func next_card():
        if assigned_cards.is_empty():
            return null
        var card = assigned_cards[card_index]
        card_index = (card_index + 1) % assigned_cards.size()
        return card

func start_combat(party_data: Array, enemy_data: Array) -> void:
    ## Initialize combatants and build the first turn order.
    _rng.randomize()
    combat_log.clear()
    loot_gained.clear()
    xp_gained = 0
    party_members.clear()
    enemies.clear()
    for pd in party_data:
        party_members.append(Combatant.new(pd, true))
    for ed in enemy_data:
        enemies.append(Combatant.new(ed, false))
    _build_turn_order()
    _run_battle()

func _build_turn_order() -> void:
    turn_order = []
    for c in party_members:
        if c.current_hp > 0:
            turn_order.append(c)
    for c in enemies:
        if c.current_hp > 0:
            turn_order.append(c)
    # Shuffle first so ties can be broken randomly
    for i in range(turn_order.size()):
        var j = _rng.randi_range(i, turn_order.size() - 1)
        turn_order.swap(i, j)
    turn_order.sort_custom(self, "_compare_speed")

func _compare_speed(a: Combatant, b: Combatant) -> int:
    if a.data.speed_modifier == b.data.speed_modifier:
        return 0
    return int(b.data.speed_modifier - a.data.speed_modifier)

func _run_battle() -> void:
    while true:
        for actor in turn_order:
            if _is_side_defeated(party_members) or _is_side_defeated(enemies):
                break
            _process_turn(actor)
        if _is_side_defeated(party_members) or _is_side_defeated(enemies):
            break
        _build_turn_order()  # new round
    var victory := not _is_side_defeated(party_members)
    _end_combat(victory)

func _process_turn(actor: Combatant) -> void:
    if actor.current_hp <= 0:
        return
    if _should_skip_turn(actor):
        _log("%s is unable to act." % _get_name(actor))
        return
    var card = actor.next_card()
    if card == null:
        _log("%s has no card to play." % _get_name(actor))
        return
    var targets = _get_valid_targets(actor, card)
    var multiplier = _compute_effect_modifier(actor, card)
    _apply_card_effect(actor, card, targets, multiplier)

func _get_name(c: Combatant) -> String:
    return c.data.character_name if c.is_player else c.data.enemy_name

func _should_skip_turn(c: Combatant) -> bool:
    return _is_stunned(c) or _is_silenced(c) or _is_disabled(c)

func _is_stunned(c: Combatant) -> bool:
    ## Placeholder for stun status check
    return c.statuses.get("stun", false)

func _is_silenced(c: Combatant) -> bool:
    ## Placeholder for silence status check
    return c.statuses.get("silence", false)

func _is_disabled(c: Combatant) -> bool:
    ## Placeholder for disable status check
    return c.statuses.get("disable", false)

func _get_valid_targets(user: Combatant, card) -> Array:
    ## Placeholder target selection based on simple rules.
    var pool = user.is_player ? enemies : party_members
    var result: Array = []
    for t in pool:
        if t.current_hp > 0:
            result.append(t)
            break
    return result

func _compute_effect_modifier(user: Combatant, card) -> float:
    var modifier: float = 1.0
    if card.role_restriction != "":
        var role_names = ["Tank", "Healer", "Support", "DPS"]
        var role_str = role_names[user.data.role] if user.is_player else ""
        if role_str != card.role_restriction:
            modifier *= 0.25  # -75% penalty
    if card.class_restriction != "":
        var class_name = user.data.class_name if user.is_player else ""
        if class_name == card.class_restriction:
            modifier *= 1.25  # bonus for correct class
    return modifier

func _apply_card_effect(user: Combatant, card, targets: Array, multiplier: float) -> void:
    ## Placeholder for resolving the card's effect with the given modifier.
    for t in targets:
        card.apply_effect(t)
    _log("%s uses %s on %s" % [
        _get_name(user), card.card_name,
        ", ".join([_get_name(x) for x in targets])])

func _is_side_defeated(side: Array) -> bool:
    for c in side:
        if c.current_hp > 0:
            return false
    return true

func _end_combat(victory: bool) -> void:
    if victory:
        _log("Party is victorious!")
        _apply_survival_penalties()
        _distribute_loot_and_xp()
        _show_post_battle_summary()
    else:
        _log("Party was defeated.")
        _show_post_battle_summary()
    emit_signal("combat_finished", victory)

func _apply_survival_penalties() -> void:
    for c in party_members:
        c.fatigue += 1
        c.hunger += 1
        c.thirst += 1

func _distribute_loot_and_xp() -> void:
    ## Simple loot and experience distribution placeholder
    for enemy in enemies:
        if enemy.data.loot_table:
            for item in enemy.data.loot_table:
                loot_gained.append(item)
                # Add loot to the first party member's inventory as a stub
                if party_members.size() > 0:
                    party_members[0].data.inventory.append(item)
    xp_gained = enemies.size() * 10

func _show_post_battle_summary() -> void:
    print("=== Battle Summary ===")
    for entry in combat_log:
        print(entry)
    print("--- Rewards ---")
    print("XP Gained: %d" % xp_gained)
    if loot_gained.is_empty():
        print("No loot acquired.")
    else:
        for item in loot_gained:
            var name = item.card_name if item.has_method("apply_effect") else String(item)
            print("Loot: %s" % name)
    print("--- Party Status ---")
    for c in party_members:
        print("%s HP:%d Fatigue:%d Hunger:%d Thirst:%d" % [
            c.data.character_name, c.current_hp, c.fatigue, c.hunger, c.thirst])
    print("1) Continue to map\n2) View inventory\n3) Rest")

func _log(message: String) -> void:
    combat_log.append(message)
    print(message)
