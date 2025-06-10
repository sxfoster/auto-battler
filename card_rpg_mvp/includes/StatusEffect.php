<?php
// includes/StatusEffect.php
// Represents a single active buff or debuff on an entity

class StatusEffect {
    public $type; // e.g., 'Stun', 'Poison', 'AttackBoost', 'Evasion'
    public $amount; // Numeric value for buffs/debuffs (e.g., +2 attack, -1 defense, 5 HP heal)
    public $duration; // Turns remaining
    public $is_debuff; // true if it's a debuff, false if a buff
    public $source_card_id; // ID of the card that applied this effect
    public $stat_affected; // e.g., 'attack', 'defense', 'speed', 'evasion'
    public $condition_trigger; // e.g., 'on_attacked' for traps

    public function __construct($type, $amount, $duration, $is_debuff, $stat_affected = null, $source_card_id = null, $condition_trigger = null) {
        $this->type = $type;
        $this->amount = $amount;
        $this->duration = $duration;
        $this->is_debuff = $is_debuff;
        $this->stat_affected = $stat_affected;
        $this->source_card_id = $source_card_id;
        $this->condition_trigger = $condition_trigger;
    }
}
?>
