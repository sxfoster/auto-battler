<?php
// includes/AIPlayer.php

require_once __DIR__ . '/Card.php';
require_once __DIR__ . '/GameEntity.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/Team.php'; // Ensure Team.php is included

class AIPlayer {
    private $persona; // AI Persona object (from db)
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
        if ($personaData) {
            $this->persona = json_decode($personaData['priorities'], true);
        } else {
            // Default to Aggressive if persona not found
            $this->persona = json_decode('{"card_priority": ["damage", "direct_damage", "aoe_damage"], "target_priority": "lowest_hp", "buff_use_threshold": 0.2, "item_use_priority": ["offense"] }', true);
            error_log("AI Persona ID {$personaId} not found. Defaulting to Aggressive.");
        }
    }

    /**
     * Decides which card an AI entity should play and on whom.
     * @param GameEntity $aiEntity The AI-controlled entity.
     * @param Team $actingTeam The team the entity belongs to.
     * @param Team $opposingTeam The enemy team.
     * @param Card[] $availableCards The cards currently in the AI entity's hand/deck.
     * @return array|null Returns ['card' => Card object, 'target' => GameEntity object] or null if no action.
     */
    public function decideAction(GameEntity $activeEntity, Team $actingTeam, Team $opposingTeam, array $availableCards) {
        $bestAction = null;
        $bestScore = -1;

        $targetPriorityType = $this->persona["target_priority"];
        $cardPriorities = $this->persona["card_priority"];

        $affordableCards = array_filter($availableCards, function($card) use ($activeEntity) {
            return $activeEntity->current_energy >= $card->energy_cost;
        });

        if (empty($affordableCards)) {
            return null;
        }

        foreach ($cardPriorities as $currentPriorityType) {
            usort($affordableCards, function($a, $b) use ($currentPriorityType) {
                return $this->scoreCard($b, $currentPriorityType) <=> $this->scoreCard($a, $currentPriorityType);
            });

            foreach ($affordableCards as $card) {
                $potentialTargets = $this->getPotentialTargets($activeEntity, $card, $actingTeam, $opposingTeam);
                $potentialTargets = array_filter($potentialTargets, fn($t) => $t instanceof GameEntity && $t->current_hp > 0);
                if (empty($potentialTargets)) {
                    continue;
                }
                $chosenTargetEntity = $this->selectBestTarget($activeEntity, $potentialTargets, $targetPriorityType);
                if ($chosenTargetEntity) {
                    return ["card" => $card, "target_entity" => $chosenTargetEntity];
                }
            }
        }
        return null;
    }

    private function scoreCard(Card $card, string $priorityType): float {
        $score = 0;
        $effectType = $card->effect_details["type"] ?? "";
        $damageMultiplier = $this->persona["damage_card_score_multiplier"] ?? 1;
        $aoeBonus = $this->persona["aoe_damage_bonus_score"] ?? 0;
        $lethalBonus = $this->persona["lethal_damage_bonus_score"] ?? 0;
        $healThreshold = $this->persona["heal_use_threshold"] ?? 0.5;
        $defenseThreshold = $this->persona["defense_use_threshold"] ?? 0.5;

        switch ($priorityType) {
            case "damage":
                if (strpos($effectType, "damage") !== false) {
                    $baseDamage = $card->effect_details["damage"] ?? 0;
                    $score += $baseDamage * $damageMultiplier;
                    if (strpos($effectType, "aoe") !== false) $score += $aoeBonus;
                }
                break;
            case "heal":
                if (strpos($effectType, "heal") !== false) {
                    $baseHeal = $card->effect_details["amount"] ?? 0;
                    $score += $baseHeal * 5;
                }
                break;
            case "defense":
                if (strpos($effectType, "reduction") !== false || strpos($effectType, "block") !== false || strpos($effectType, "immunity") !== false) {
                    $score += 10;
                }
                break;
            case "utility":
                $score += 2;
                break;
        }
        return $score;
    }

    private function selectBestTarget(GameEntity $activeEntity, array $potentialTargets, string $targetPriorityType): ?GameEntity {
        if (empty($potentialTargets)) {
            return null;
        }
        if ($targetPriorityType === "lowest_hp_enemy") {
            $enemies = array_filter($potentialTargets, fn($t) => $t->team !== $activeEntity->team);
            if (!empty($enemies)) {
                usort($enemies, fn($a, $b) => $a->current_hp <=> $b->current_hp);
                return $enemies[0];
            }
        } elseif ($targetPriorityType === "lowest_hp_ally") {
            $allies = array_filter($potentialTargets, fn($t) => $t->team === $activeEntity->team);
            if (!empty($allies)) {
                usort($allies, fn($a, $b) => $a->current_hp <=> $b->current_hp);
                return $allies[0];
            }
        }
        return $potentialTargets[array_rand($potentialTargets)];
    }

    private function getPotentialTargets(GameEntity $caster, Card $card, Team $actingTeam, Team $opposingTeam): array {
        $effectDetails = $card->effect_details;
        $targets = [];
        $cardTargetType = $effectDetails["target"] ?? null;
        switch ($cardTargetType) {
            case "self": $targets = [$caster]; break;
            case "single_ally": $targets = $actingTeam->getActiveEntities(); break;
            case "all_allies": $targets = $actingTeam->getActiveEntities(); break;
            case "single_enemy": $targets = $opposingTeam->getActiveEntities(); break;
            case "random_enemy": $targets = $opposingTeam->getActiveEntities(); break;
            case "all_enemies": $targets = $opposingTeam->getActiveEntities(); break;
            default:
                if ($card->card_type === "armor" || (strpos($effectDetails["type"] ?? "", "buff") !== false && !strpos($effectDetails["type"] ?? "", "damage") !== false)) {
                    $targets = [$caster];
                } elseif ($card->card_type === "weapon" || strpos($effectDetails["type"] ?? "", "damage") !== false) {
                    $targets = $opposingTeam->getActiveEntities();
                } else {
                    $targets = [$caster];
                }
                break;
        }
        return $targets;
    }

}
?>
