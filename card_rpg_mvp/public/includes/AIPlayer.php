<?php
// includes/AIPlayer.php

require_once __DIR__ . '/Card.php';
require_once __DIR__ . '/GameEntity.php';
require_once __DIR__ . '/db.php'; // To fetch persona data

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

        $targetPriorities = $this->persona['target_priority'] ?? 'random';
        $cardPriorities = $this->persona['card_priority'] ?? ['damage', 'heal', 'defense', 'utility'];

        $affordableCards = array_filter($availableCards, function($card) use ($activeEntity) {
            return $activeEntity->current_energy >= $card->energy_cost;
        });

        if (empty($affordableCards)) {
            return null;
        }

        foreach ($cardPriorities as $priorityType) {
            usort($affordableCards, function($a, $b) use ($priorityType) {
                $scoreA = 0; $scoreB = 0;
                if ($priorityType === 'damage') {
                    if (strpos($a->effect_details['type'] ?? '', 'damage') !== false) $scoreA += ($a->effect_details['damage'] ?? 0);
                    if (strpos($b->effect_details['type'] ?? '', 'damage') !== false) $scoreB += ($b->effect_details['damage'] ?? 0);
                } elseif ($priorityType === 'defense') {
                    if (strpos($a->effect_details['type'] ?? '', 'reduction') !== false || strpos($a->effect_details['type'] ?? '', 'block') !== false) $scoreA += 1;
                    if (strpos($b->effect_details['type'] ?? '', 'reduction') !== false || strpos($b->effect_details['type'] ?? '', 'block') !== false) $scoreB += 1;
                } elseif ($priorityType === 'heal') {
                    if (strpos($a->effect_details['type'] ?? '', 'heal') !== false) $scoreA += ($a->effect_details['amount'] ?? 0);
                    if (strpos($b->effect_details['type'] ?? '', 'heal') !== false) $scoreB += ($b->effect_details['amount'] ?? 0);
                }
                return $scoreB - $scoreA;
            });

            foreach ($affordableCards as $card) {
                $potentialTargets = [];
                $cardTargetType = $card->effect_details['target'] ?? null;

                if ($cardTargetType === 'self') {
                    $potentialTargets = [$activeEntity];
                } elseif ($cardTargetType === 'single_ally' || $cardTargetType === 'all_allies') {
                    $potentialTargets = $actingTeam->getActiveEntities();
                } elseif ($cardTargetType === 'single_enemy' || $cardTargetType === 'random_enemy' || $cardTargetType === 'all_enemies') {
                    $potentialTargets = $opposingTeam->getActiveEntities();
                } else {
                    if ($card->card_type === 'weapon' || ($card->card_type === 'ability' && strpos($card->effect_details['type'] ?? '', 'damage') !== false)) {
                        $potentialTargets = $opposingTeam->getActiveEntities();
                    } else {
                        $potentialTargets = [$activeEntity];
                    }
                }

                $potentialTargets = array_filter($potentialTargets, fn($t) => $t instanceof GameEntity && $t->current_hp > 0);
                if (empty($potentialTargets)) {
                    continue;
                }

                $chosenTargetEntity = null;
                if ($targetPriorities === 'lowest_hp') {
                    usort($potentialTargets, fn($a, $b) => $a->current_hp <=> $b->current_hp);
                    $chosenTargetEntity = $potentialTargets[0];
                } elseif ($targetPriorities === 'highest_hp') {
                    usort($potentialTargets, fn($a, $b) => $b->current_hp <=> $a->current_hp);
                    $chosenTargetEntity = $potentialTargets[0];
                } else {
                    $chosenTargetEntity = $potentialTargets[array_rand($potentialTargets)];
                }

                if ($chosenTargetEntity) {
                    return ['card' => $card, 'target_entity' => $chosenTargetEntity];
                }
            }
        }

        return null;
    }
}
?>
