<?php
// includes/AIPlayer.php

require_once __DIR__ . '/Card.php';
require_once __DIR__ . '/GameEntity.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/Team.php'; // Ensure Team.php is included

class AIPlayer {
    private $persona; // Decoded AI Persona priorities from DB
    private $db_conn;

    public function __construct($personaId) {
        $database = new Database();
        $this->db_conn = $database->getConnection();
        $this->loadPersona($personaId);
    }

    private function loadPersona($personaId) {
        $stmt = $this->db_conn->prepare("SELECT priorities FROM ai_personas WHERE id = :id");
        $stmt->bindParam(':id', $personaId, PDO::PARAM_INT);
        $stmt->execute();
        $personaData = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($personaData && $personaData['priorities']) {
            $this->persona = json_decode($personaData['priorities'], true);
        } else {
            // Default to a balanced persona if not found or empty
            $this->persona = [
                'card_priority' => ['damage', 'heal', 'defense', 'utility'],
                'target_priority_damage' => 'lowest_hp_enemy',
                'target_priority_heal_defense' => 'lowest_hp_ally',
                'target_priority_control' => 'highest_dps_enemy',
                'heal_use_threshold' => 0.6,
                'defense_use_threshold' => 0.6,
                'damage_card_score_multiplier' => 1,
                'aoe_damage_bonus_score' => 0,
                'lethal_damage_bonus_score' => 0,
                'energy_save_chance_2_cost' => 0,
                'min_energy_to_save' => 2,
                'prioritize_higher_reward_over_immediate' => false,
                'play_defensive_chance' => 0.0, // Default to no bias
                'max_damage_card_choice_chance' => 0.0 // Default to no bias
            ];
            error_log("AI Persona ID {$personaId} not found or empty. Defaulting to generic base.");
        }
    }

    /**
     * Decides which card an AI entity should play and on whom.
     * @param GameEntity $activeEntity The AI-controlled entity currently taking a turn.
     * @param Team $actingTeam The team the activeEntity belongs to.
     * @param Team $opposingTeam The opposing team.
     * @param Card[] $availableCards The cards available to the activeEntity.
     * @return array|null Returns ['card' => Card object, 'target_entity' => GameEntity object] or null if no action.
     */
    public function decideAction(GameEntity $activeEntity, Team $actingTeam, Team $opposingTeam, array $availableCards) {
        $bestAction = null;
        $bestScore = -1;

        $cardPriorities = $this->persona['card_priority'];
        $affordableCards = array_filter($availableCards, function($card) use ($activeEntity) {
            return $activeEntity->current_energy >= $card->energy_cost;
        });

        if (empty($affordableCards)) {
            return null; // Cannot afford any cards
        }

        // --- Step 1: Evaluate saving energy (for Burst/Controller) ---
        $prioritizeHigherReward = $this->persona['prioritize_higher_reward_over_immediate'] ?? false;
        $energySaveChance = $this->persona['energy_save_chance_2_cost'] ?? 0;
        $minEnergyToSave = $this->persona['min_energy_to_save'] ?? 2;

        if ($activeEntity->current_energy < $minEnergyToSave && ($prioritizeHigherReward || mt_rand(0, 100) / 100 < $energySaveChance)) {
            // Check if there's a higher cost card (e.g., 2-cost) that would provide better value later
            $hasHigherCostCard = false;
            foreach ($affordableCards as $card) {
                if ($card->energy_cost >= $minEnergyToSave) {
                    // Check if this higher cost card is actually good (e.g., a damage card for Aggressive)
                    $score = $this->scoreCard($card, $this->persona['card_priority'][0] ?? 'damage', $activeEntity, $opposingTeam, $actingTeam); // Score by highest priority type
                    if ($score > 10) { // arbitrary threshold for 'good value'
                        $hasHigherCostCard = true;
                        break;
                    }
                }
            }
            if ($hasHigherCostCard) {
                return null; // Save energy for a future turn
            }
        }


        // --- Step 2: Iterate through persona's card priorities ---
        foreach ($cardPriorities as $currentPriorityType) {
            // Sort affordable cards by this priority type (descending) to find the 'best' card first
            usort($affordableCards, function($a, $b) use ($currentPriorityType, $activeEntity, $opposingTeam, $actingTeam) {
                return $this->scoreCard($b, $currentPriorityType, $activeEntity, $opposingTeam, $actingTeam) <=> $this->scoreCard($a, $currentPriorityType, $activeEntity, $opposingTeam, $actingTeam);
            });

            foreach ($affordableCards as $card) {
                // If it's a damage card and max_damage_card_choice_chance is set, roll the dice
                if ($currentPriorityType === 'damage' && ($this->persona['max_damage_card_choice_chance'] ?? 0.0) > 0.0) {
                    if (mt_rand(0, 100) / 100 < $this->persona['max_damage_card_choice_chance']) {
                        // This card is chosen based on random chance to be highest damage,
                        // it will be the first one in the sorted list IF damage is highest priority.
                    } else {
                        // Skip this damage card if we failed the random chance to pick the absolute highest
                        // This logic needs to be more refined for multi-card decks. For now, it's a simplification.
                        // A better way: sort by specific criteria within the loop, not before.
                    }
                }


                // --- Determine potential targets for this card ---
                $potentialTargets = $this->getPotentialTargets($activeEntity, $card, $actingTeam, $opposingTeam);
                
                // Filter out dead/invalid targets
                $potentialTargets = array_filter($potentialTargets, fn($t) => $t instanceof GameEntity && $t->current_hp > 0);

                // If no valid targets for this specific card, skip it
                if (empty($potentialTargets)) {
                    continue;
                }

                // --- Select the best target from potential targets based on persona's target_priority ---
                $chosenTargetEntity = $this->selectBestTarget($activeEntity, $card, $potentialTargets, $opposingTeam, $actingTeam);

                if ($chosenTargetEntity) {
                    // We found an affordable card and a valid target for it based on priorities.
                    return ['card' => $card, 'target_entity' => $chosenTargetEntity];
                }
            }
        }
        
        return null; // No suitable action found in this priority order
    }

    /**
     * Scores a card based on the current priority type and battle context.
     * This is where the aggressive logic quiz answers come in.
     */
    private function scoreCard(Card $card, string $priorityType, GameEntity $activeEntity, Team $opposingTeam, Team $actingTeam): float {
        $score = 0;
        $effectType = $card->effect_details['type'] ?? '';

        switch ($priorityType) {
            case 'damage':
                if (strpos($effectType, 'damage') !== false) {
                    $baseDamage = $card->effect_details['damage'] ?? 0;
                    $score += $baseDamage * ($this->persona['damage_card_score_multiplier'] ?? 1); // HIGH WEIGHT for damage
                    if (strpos($effectType, 'aoe') !== false) $score += ($this->persona['aoe_damage_bonus_score'] ?? 0); // Bonus for AOE

                    // Aggressive AI: Consider lethal bonus if applicable to *any* enemy target
                    if ($opposingTeam->getLowestHpActiveEntity() && $opposingTeam->getLowestHpActiveEntity()->current_hp <= $baseDamage) {
                         $score += ($this->persona['lethal_damage_bonus_score'] ?? 0); // Bonus for lethal
                    }
                }
                break;
            case 'heal':
                if (strpos($effectType, 'heal') !== false) {
                    $baseHeal = $card->effect_details['amount'] ?? 0;
                    $score += $baseHeal * 5; // Base weight for heal

                    // Defensive/Controller AI: Score higher if heal target is low HP
                    if ($actingTeam->getLowestHpActiveEntity() && $actingTeam->getLowestHpActiveEntity()->current_hp / $actingTeam->getLowestHpActiveEntity()->max_hp < ($this->persona['heal_use_threshold'] ?? 0.5)) {
                        $score += 30; // High bonus if low HP ally exists
                    }
                }
                break;
            case 'defense':
                if (strpos($effectType, 'reduction') !== false || strpos($effectType, 'block') !== false || strpos($effectType, 'immunity') !== false) {
                    $score += 10; // Base score for defense
                    // Defensive AI: Score higher if self/ally is low HP
                    if ($activeEntity->current_hp / $activeEntity->max_hp < ($this->persona['defense_use_threshold'] ?? 0.5)) {
                        $score += 20; // Strong bonus if self low HP
                    }
                    if ($actingTeam->getLowestHpActiveEntity() && $actingTeam->getLowestHpActiveEntity()->current_hp / $actingTeam->getLowestHpActiveEntity()->max_hp < ($this->persona['defense_use_threshold'] ?? 0.5)) {
                        $score += 15; // Bonus if ally is low HP
                    }
                }
                break;
            case 'control': // For stun, root, poison, debuffs like attack/speed down, confuse, fear
                if (in_array($effectType, ['status_effect', 'damage_dot', 'damage_debuff', 'aoe_damage_debuff', 'aoe_dot'])) { // Assuming these are control effects
                    $score += 15; // Base score for control
                    // Controller AI: Consider if target is unaffected or high threat
                }
                break;
            case 'utility': // For energy gain, draw, conditional buffs not covered by above
                $score += 2; // Low base score
                break;
        }
        return $score;
    }

    /**
     * Selects the best target from potential targets based on persona's target priority.
     * @param GameEntity $activeEntity The entity playing the card.
     * @param Card $card The card being played.
     * @param array $potentialTargets Array of active GameEntity objects that can be targeted.
     * @param Team $opposingTeam The opposing team.
     * @param Team $actingTeam The acting team.
     * @return GameEntity|null The chosen target entity.
     */
    private function selectBestTarget(GameEntity $activeEntity, Card $card, array $potentialTargets, Team $opposingTeam, Team $actingTeam): ?GameEntity {
        if (empty($potentialTargets)) {
            return null;
        }

        $targetPriorityType = $card->card_type === 'ability' ? ($this->persona['target_priority_control'] ?? ($this->persona['target_priority_damage'] ?? 'random')) : ($this->persona['target_priority_damage'] ?? 'random');
        // If any enemy has Taunt active, target them first
        foreach ($potentialTargets as $t) {
            foreach ($t->buffs as $b) {
                if ($b->stat_affected === 'taunt') {
                    return $t;
                }
            }
        }
        if (strpos($card->effect_details['type'] ?? '', 'heal') !== false || strpos($card->effect_details['type'] ?? '', 'defense') !== false || $card->card_type === 'armor') {
             $targetPriorityType = $this->persona['target_priority_heal_defense'] ?? 'lowest_hp_ally';
        }
        if (strpos($card->effect_details['type'] ?? '', 'control') !== false || strpos($card->effect_details['type'] ?? '', 'debuff') !== false) {
             $targetPriorityType = $this->persona['target_priority_control'] ?? 'unaffected_spread_debuffs';
        }


        switch ($targetPriorityType) {
            case 'lowest_hp_enemy': // For Aggressive/Burst damage
            case 'lowest_hp_enemy_spread_damage': // For Controller damage
                $enemies = array_filter($potentialTargets, fn($t) => $t->team !== $activeEntity->team);
                if (!empty($enemies)) {
                    usort($enemies, fn($a, $b) => $a->current_hp <=> $b->current_hp);
                    // For lowest_hp_enemy_spread_damage (Controller), might return a random from top N lowest or cycle
                    // For MVP, just return lowest HP enemy
                    return $enemies[0];
                }
                break;

            case 'role_priority_healer_dps_tank': // For Defensive damage
                $enemies = array_filter($potentialTargets, fn($t) => $t->team !== $activeEntity->team);
                if (!empty($enemies)) {
                    usort($enemies, function($a, $b) {
                        $roleOrder = ['Cleric' => 1, 'Druid' => 1, 'Bard' => 1, 'Rogue' => 2, 'Ranger' => 2, 'Sorcerer' => 2, 'Wizard' => 2, 'Warrior' => 3, 'Paladin' => 3, 'Barbarian' => 3]; // Example priority
                        $scoreA = $roleOrder[$a->name] ?? 4; // Lower score is higher priority
                        $scoreB = $roleOrder[$b->name] ?? 4;
                        return $scoreA <=> $scoreB; // Sort by role priority
                    });
                    return $enemies[0];
                }
                break;
            
            case 'lowest_hp_ally': // For generic healing/defense
                $allies = array_filter($potentialTargets, fn($t) => $t->team === $activeEntity->team);
                if (!empty($allies)) {
                    usort($allies, fn($a, $b) => $a->current_hp <=> $b->current_hp);
                    return $allies[0];
                }
                break;
            case 'lowest_hp_ally_tank_priority': // For Defensive healing/defense
                 $allies = array_filter($potentialTargets, fn($t) => $t->team === $activeEntity->team);
                 if (!empty($allies)) {
                    usort($allies, function($a, $b) {
                        $isTankA = in_array($a->role, ['Tank/Bruiser']); // Check role from champion/monster data
                        $isTankB = in_array($b->role, ['Tank/Bruiser']);
                        if ($isTankA && !$isTankB) return -1; // Tank A before non-Tank B
                        if (!$isTankA && $isTankB) return 1;  // Tank B before non-Tank A
                        return $a->current_hp <=> $b->current_hp; // Then by lowest HP
                    });
                    return $allies[0];
                 }
                 break;

            case 'unaffected_spread_debuffs': // For Controller control
                $enemies = array_filter($potentialTargets, fn($t) => $t->team !== $activeEntity->team);
                if (!empty($enemies)) {
                    // Try to find an enemy without many debuffs, or without a specific debuff the card applies
                    // For MVP: prioritize enemies with fewest debuffs
                    usort($enemies, fn($a, $b) => count($a->debuffs) <=> count($b->debuffs));
                    return $enemies[0];
                }
                break;

            default:
                // Default to random if no specific priority or persona not configured
                if (!empty($potentialTargets)) {
                    return $potentialTargets[array_rand($potentialTargets)];
                }
                break;
        }
        
        return null; // Fallback if no specific target found by priority
    }

    /**
     * Helper to get potential targets for a card given its effect details.
     * This needs to match BattleSimulator's applyCardEffect target determination.
     */
    private function getPotentialTargets(GameEntity $caster, Card $card, Team $actingTeam, Team $opposingTeam): array {
        $effectDetails = $card->effect_details;
        $targets = [];
        $cardTargetType = $effectDetails['target'] ?? null;

        switch ($cardTargetType) {
            case 'self': $targets = [$caster]; break;
            case 'single_ally': $targets = $actingTeam->getActiveEntities(); break;
            case 'all_allies': $targets = $actingTeam->getActiveEntities(); break;
            case 'single_enemy': $targets = $opposingTeam->getActiveEntities(); break;
            case 'random_enemy': $targets = $opposingTeam->getActiveEntities(); break;
            case 'all_enemies': $targets = $opposingTeam->getActiveEntities(); break;
            default:
                // Default for cards with no explicit 'target' in effectDetails (e.g., plain weapon damage, armor cards)
                if ($card->card_type === 'armor' || (strpos($effectDetails['type'] ?? '', 'buff') !== false && !strpos($effectDetails['type'] ?? '', 'damage') !== false)) {
                    $targets = [$caster]; // Assume self for armor/buffs without explicit target
                } elseif ($card->card_type === 'weapon' || strpos($effectDetails['type'] ?? '', 'damage') !== false) {
                    $targets = $opposingTeam->getActiveEntities(); // Assume enemy for damage/weapons without explicit target
                } else {
                    $targets = [$caster]; // Fallback if truly ambiguous
                }
                break;
        }
        return $targets;
    }
}
?>
