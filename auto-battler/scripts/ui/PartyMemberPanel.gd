extends Panel

signal card_assigned(card)
signal gear_changed(gear)

var assigned_cards: Array = []

func assign_card(card):
    if assigned_cards.size() < 4:
        assigned_cards.append(card)
        emit_signal("card_assigned", card)

func change_gear(gear):
    emit_signal("gear_changed", gear)
