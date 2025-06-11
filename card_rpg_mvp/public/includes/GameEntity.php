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
    public $current_magic_defense_reduction; // reduction against magic damage
    public $current_block_charges; // physical block charges
    public $current_magic_block_charges; // magic block charges
    public $base_attack; // baseline attack value
    public $current_attack; // attack after buffs/debuffs
    public $base_crit_chance; // base critical hit chance
    public $current_crit_chance; // crit chance after buffs/debuffs
    public $prevent_defeat_active = false; // Flag for "prevent defeat" status
    public $display_name; // Unique name for UI/logging
    public $buffs = []; // Array of active StatusEffect objects
    public $debuffs = []; // Array of active StatusEffect objects
    public $deck = []; // Array of Card objects (the full deck)
    public $hand = []; // Array of Card objects currently in hand (for MVP, maybe just 'available cards')
    public $discard = []; // Array of Card objects in discard
    public $team; // Reference to the team this entity belongs to (PlayerTeam or AITeam)
    public $isPlayerTeam = false; // flag for which side owns this entity
    public $role; // Tank, DPS, Support etc.

    public function __construct($id, $name, $hp, $speed, $role = 'unknown', $base_attack = 1, $display_name = null, $base_crit_chance = 0) {
        $this->id = $id;
        $this->name = $name;
        $this->max_hp = $hp;
        $this->current_hp = $hp;
        $this->base_speed = $speed;
        $this->current_speed = $speed; // Speed can be modified by buffs/debuffs
        $this->current_energy = 1; // All start with 1 energy at Level 1, as per GDD
        $this->current_evasion = 0;
        $this->current_defense_reduction = 0;
        $this->current_magic_defense_reduction = 0;
        $this->current_block_charges = 0;
        $this->current_magic_block_charges = 0;
        $this->role = $role;
        $this->base_attack = $base_attack;
        $this->current_attack = $base_attack;
        $this->display_name = $display_name ?? $name;
        $this->base_crit_chance = $base_crit_chance;
        $this->current_crit_chance = $base_crit_chance;
        $this->prevent_defeat_active = false;
    }

    public function takeDamage($amount, $damage_type = NULL) {
        $effectiveDamage = $amount; // This 'amount' is the base damage *after* calculateDamage (type vs armor)

        // Check for Total Immunity buff
        foreach ($this->buffs as $effect) {
            if ($effect->stat_affected === 'total_immunity') {
                return 0;
            }
        }

        // 1. Handle Block charges (consume first if damage is completely blocked)
        if ($damage_type !== 'Magic' && $this->current_block_charges > 0) {
            $this->current_block_charges--; // Consume a charge
            return 0; // Damage completely blocked
        }
        if ($damage_type === 'Magic' && $this->current_magic_block_charges > 0) {
            $this->current_magic_block_charges--; // Consume a charge
            return 0; // Magic damage completely blocked
        }

        // 2. Apply general defense reduction
        $effectiveDamage = $effectiveDamage - $this->current_defense_reduction;

        // 3. Apply magic defense reduction (only if damage is magic)
        if ($damage_type === 'Magic') {
            $effectiveDamage = $effectiveDamage - $this->current_magic_defense_reduction;
        }

        // Ensure damage doesn't go below zero after reductions
        $damageToApply = max(0, $effectiveDamage);

        $this->current_hp -= $damageToApply;

        if ($this->current_hp <= 0 && $this->prevent_defeat_active) {
            $this->current_hp = 1;
            $this->prevent_defeat_active = false;
        }

        if ($this->current_hp < 0) {
            $this->current_hp = 0;
        }
        return $damageToApply; // Return actual damage taken
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
        if ($effect->stat_affected === 'prevent_defeat') {
            $this->prevent_defeat_active = true;
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
        $this->current_magic_defense_reduction = 0;
        $this->current_block_charges = 0;
        $this->current_magic_block_charges = 0;

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
        return $this->current_attack;
    }

    // Serialize the entity state for logging/JSON output
    public function toArray() {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'displayName' => $this->display_name,
            'role' => $this->role,
            'max_hp' => $this->max_hp,
            'current_hp' => $this->current_hp,
            'current_energy' => $this->current_energy,
            'base_speed' => $this->base_speed,
            'current_speed' => $this->current_speed,
            'base_attack' => $this->base_attack,
            'current_attack' => $this->current_attack,
            'base_crit_chance' => $this->base_crit_chance,
            'current_crit_chance' => $this->current_crit_chance,
            'buffs' => array_map(fn($b) => [
                'type' => $b->type,
                'amount' => $b->amount,
                'duration' => $b->duration,
                'is_debuff' => $b->is_debuff,
                'stat_affected' => $b->stat_affected
            ], $this->buffs),
            'debuffs' => array_map(fn($d) => [
                'type' => $d->type,
                'amount' => $d->amount,
                'duration' => $d->duration,
                'is_debuff' => $d->is_debuff,
                'stat_affected' => $d->stat_affected
            ], $this->debuffs)
        ];
    }
}
?>
