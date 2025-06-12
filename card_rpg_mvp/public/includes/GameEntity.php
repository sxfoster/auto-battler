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
    public $current_evasion;
    public $current_defense_reduction;
    public $current_magic_defense_reduction;
    public $current_block_charges;
    public $current_magic_block_charges;
    public $base_attack;
    public $current_attack;
    public $base_crit_chance;
    public $current_crit_chance; // Corrected line
    public $prevent_defeat_active = false;
    public $display_name;
    public $buffs = [];
    public $debuffs = [];
    public $deck = [];
    public $hand = [];
    public $discard = [];
    public $team;
    public $isPlayerTeam = false;
    public $role;

    public function __construct($id, $name, $hp, $speed, $role = 'unknown', $base_attack = 1, $display_name = null, $base_crit_chance = 0) {
        $this->id = $id;
        $this->name = $name;
        $this->max_hp = $hp;
        $this->current_hp = $hp;
        $this->base_speed = $speed;
        $this->current_speed = $speed;
        $this->current_energy = 1;
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
        $effectiveDamage = $amount;

        foreach ($this->buffs as $effect) {
            if ($effect->stat_affected === 'total_immunity') {
                return 0;
            }
        }

        if ($damage_type !== 'Magic' && $this->current_block_charges > 0) {
            $this->current_block_charges--;
            return 0;
        }
        if ($damage_type === 'Magic' && $this->current_magic_block_charges > 0) {
            $this->current_magic_block_charges--;
            return 0;
        }

        $effectiveDamage -= $this->current_defense_reduction;

        if ($damage_type === 'Magic') {
            $effectiveDamage -= $this->current_magic_defense_reduction;
        }

        $damageToApply = max(0, $effectiveDamage);
        $this->current_hp -= $damageToApply;

        if ($this->current_hp <= 0 && $this->prevent_defeat_active) {
            $this->current_hp = 1;
            $this->prevent_defeat_active = false;
        }

        if ($this->current_hp < 0) {
            $this->current_hp = 0;
        }
        return $damageToApply;
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
        foreach ($this->debuffs as $key => $effect) {
            if (in_array($effect->type, ['Poison', 'Bleed', 'Burn'])) {
                $damage = $effect->amount;
                $this->takeDamage($damage);
            }
        }

        foreach ($this->buffs as $key => &$effect) {
            $effect->duration--;
            if ($effect->duration <= 0) {
                unset($this->buffs[$key]);
            }
        }
        foreach ($this->debuffs as $key => &$effect) {
            $effect->duration--;
            if ($effect->duration <= 0) {
                unset($this->debuffs[$key]);
            }
        }
        
        $this->buffs = array_values($this->buffs);
        $this->debuffs = array_values($this->debuffs);
    }

    public function resetTemporaryStats() {
        $this->current_speed = $this->base_speed;
        $this->current_evasion = 0;
        $this->current_defense_reduction = 0;
        $this->current_magic_defense_reduction = 0;
        $this->current_block_charges = 0;
        $this->current_magic_block_charges = 0;
        $this->applyActiveStatModifiers();
    }

    public function applyActiveStatModifiers() {
        // This logic would be expanded in a full implementation
    }

    public function getAttackPower() {
        return $this->current_attack;
    }

    public function toArray() {
        return [
            'entityId' => $this->id,
            'displayName' => $this->display_name,
            'role' => $this->role,
            'currentHp' => $this->current_hp,
            'maxHp' => $this->max_hp
        ];
    }
}
?>
