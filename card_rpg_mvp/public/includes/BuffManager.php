<?php
// includes/BuffManager.php
// Manages application and removal of buffs/debuffs on a GameEntity

class BuffManager {
    public static function applyEffect(GameEntity $target, Card $sourceCard, array $effectDetails) {
        // This is a placeholder for the full GDD status effects logic.
        // It will be crucial to map JSON effect_details to actual StatusEffect objects.

        switch ($effectDetails['type']) {
            case 'buff':
                $effect = new StatusEffect($effectDetails['stat'], $effectDetails['amount'], $effectDetails['duration'], false, $effectDetails['stat'], $sourceCard->id);
                $target->addStatusEffect($effect);
                // Apply immediate stat change
                if ($effectDetails['stat'] === 'attack') $target->current_attack += $effectDetails['amount']; // Requires current_attack on GameEntity
                // ... handle other stats like evasion, speed, defense_reduction
                break;
            case 'damage_debuff':
                // For debuffs, first apply damage then the debuff
                $target->takeDamage($effectDetails['damage'], $sourceCard->damage_type);
                $effect = new StatusEffect($effectDetails['debuff_stat'], $effectDetails['debuff_amount'], $effectDetails['debuff_duration'], true, $effectDetails['debuff_stat'], $sourceCard->id);
                $target->addStatusEffect($effect);
                // Apply immediate stat change for debuffs like attack down
                if ($effectDetails['debuff_stat'] === 'attack') $target->current_attack -= $effectDetails['debuff_amount'];
                // ... handle other debuffs
                break;
            case 'heal':
                $target->heal($effectDetails['amount']);
                break;
            case 'status_effect': // For Stun, Root, Confuse, Shock
                $isDebuff = true; // Most direct status effects are debuffs
                $effect = new StatusEffect($effectDetails['effect'], null, $effectDetails['duration'], $isDebuff, null, $sourceCard->id);
                $target->addStatusEffect($effect);
                break;
            // ... implement logic for all other effect types defined in GDD (damage_dot, etc.)
        }
    }

    public static function updateEntityStats(GameEntity $entity) {
        // This function should be called at the start of each turn to re-calculate
        // current_speed, current_evasion, current_defense_reduction, current_attack, etc.
        // based on ALL active buffs and debuffs.

        // Reset to base stats first
        $entity->current_speed = $entity->base_speed;
        $entity->current_evasion = 0;
        $entity->current_defense_reduction = 0;
        // Add current_attack to GameEntity, initialize to base_attack
        $entity->current_attack = $entity->base_attack ?? 1; // Assuming base attack of 1 if not set

        // Apply buffs
        foreach ($entity->buffs as $effect) {
            switch ($effect->stat_affected) {
                case 'attack':
                    $entity->current_attack += $effect->amount;
                    break;
                case 'defense':
                    $entity->current_defense_reduction += $effect->amount;
                    break;
                case 'evasion':
                    $entity->current_evasion += $effect->amount;
                    break;
                case 'speed':
                    $entity->current_speed += $effect->amount;
                    break;
                // ... handle other stats
            }
        }

        // Apply debuffs
        foreach ($entity->debuffs as $effect) {
            switch ($effect->stat_affected) {
                case 'attack':
                    $entity->current_attack -= $effect->amount;
                    break;
                case 'defense':
                    $entity->current_defense_reduction -= $effect->amount;
                    break;
                case 'speed':
                    $entity->current_speed -= $effect->amount;
                    break;
                // ... handle other stats
            }
        }
    }
    
    public static function decrementDurations(GameEntity $entity) {
        // Apply HoTs first
        foreach ($entity->buffs as $key => $effect) {
            if ($effect->type === 'HoT' && $effect->stat_affected === 'hp_over_time') {
                $entity->heal($effect->amount);
            }
            $effect->duration--;
            if ($effect->duration <= 0) {
                unset($entity->buffs[$key]);
            }
        }
        $entity->buffs = array_values($entity->buffs);

        // Apply DOTs
        foreach ($entity->debuffs as $key => $effect) {
            if (in_array($effect->type, ['Poison', 'Bleed', 'Burn']) && $effect->stat_affected === 'dot_damage') {
                $entity->takeDamage($effect->amount);
            }
            $effect->duration--;
            if ($effect->duration <= 0) {
                unset($entity->debuffs[$key]);
            }
        }
        $entity->debuffs = array_values($entity->debuffs);
    }
}
?>
