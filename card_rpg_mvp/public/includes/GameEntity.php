<?php
// includes/GameEntity.php
// Base class for anything that participates in battle (Champion, Monster, Minion)

class GameEntity {
    public $id;
    public $name;
    public $max_hp;
    public $current_hp;
    public $base_speed;
    public $current_speed;
    public $current_energy;
    public $current_evasion; // temporary evasion from buffs/debuffs
    public $current_defense_reduction; // temporary defense reduction from buffs/debuffs
    public $buffs = []; // Array of active StatusEffect objects
    public $debuffs = []; // Array of active StatusEffect objects
    public $deck = []; // Array of Card objects (the full deck)
    public $hand = []; // Array of Card objects currently in hand (for MVP, maybe just 'available cards')
    public $discard = []; // Array of Card objects in discard
    public $team; // Reference to the team this entity belongs to (PlayerTeam or AITeam)
    public $role; // Tank, DPS, Support etc.

    public function __construct($id, $name, $hp, $speed, $role = 'unknown') {
        $this->id = $id;
        $this->name = $name;
        $this->max_hp = $hp;
        $this->current_hp = $hp;
        $this->base_speed = $speed;
        $this->current_speed = $speed; // Speed can be modified by buffs/debuffs
        $this->current_energy = 1; // All start with 1 energy at Level 1, as per GDD
        $this->current_evasion = 0;
        $this->current_defense_reduction = 0;
        $this->role = $role;
    }

    public function takeDamage($amount, $damage_type = NULL) {
        // Apply defense reduction based on active buffs/debuffs and armor
        $effectiveDamage = $amount - $this->current_defense_reduction;
        // Further apply armor reduction based on GDD (Weapon GDD - 4.)
        // This is a placeholder for actual armor calculation
        // For MVP, just simple reduction
        if ($this->current_defense_reduction > 0) {
            $effectiveDamage = max(0, $effectiveDamage); // Damage cannot go below 0 due to reduction
        }
        
        $this->current_hp -= $effectiveDamage;
        if ($this->current_hp < 0) {
            $this->current_hp = 0;
        }
        return $effectiveDamage; // Return actual damage taken
    }

    public function heal($amount) {
        $this->current_hp = min($this->current_hp + $amount, $this->max_hp);
    }

    public function addStatusEffect(StatusEffect $effect) {
        if ($effect->is_debuff) {
            $this->debuffs[] = $effect;
        } else {
            $this->buffs[] = $effect;
        }
    }

    public function applyTurnEffects() {
        // Apply DOTs (Poison, Bleed, Burn)
        foreach ($this->debuffs as $key => $effect) {
            if (in_array($effect->type, ['Poison', 'Bleed', 'Burn'])) {
                $damage = $effect->amount;
                $this->takeDamage($damage); // Apply damage directly
                // Log this DOT damage
            }
        }

        // Decrement durations
        foreach ($this->buffs as $key => $effect) {
            $effect->duration--;
            if ($effect->duration <= 0) {
                // Remove buff and revert stats
                unset($this->buffs[$key]);
            }
        }
        foreach ($this->debuffs as $key => $effect) {
            $effect->duration--;
            if ($effect->duration <= 0) {
                // Remove debuff and revert stats
                unset($this->debuffs[$key]);
            }
        }
        // Re-index arrays after unsetting
        $this->buffs = array_values($this->buffs);
        $this->debuffs = array_values($this->debuffs);
    }

    public function resetTemporaryStats() {
        // Reset speed, evasion, defense modifications from 1-turn effects
        $this->current_speed = $this->base_speed;
        $this->current_evasion = 0;
        $this->current_defense_reduction = 0;

        // Re-apply buffs/debuffs that last multiple turns
        $this->applyActiveStatModifiers(); // This function will be called here
    }

    public function applyActiveStatModifiers() {
        // Recalculate current_speed, current_evasion, current_defense_reduction
        // based on active buffs and debuffs for the current turn.
        // This would iterate through $this->buffs and $this->debuffs
        // and apply their stat changes. (Detailed implementation later)
    }

    // Placeholder for getting actual damage dealt by entity (needs card logic)
    public function getAttackPower() {
        return 1; // Very basic placeholder
    }
}
?>
