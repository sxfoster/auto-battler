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
            return null; // Cannot afford any cards
        }

        foreach ($cardPriorities as $priorityType) {
            foreach ($affordableCards as $card) {
                $potentialTargets = [];
                if (isset($card->effect_details['target'])) {
                    switch ($card->effect_details['target']) {
                        case 'self':
                            $potentialTargets = [$activeEntity];
                            break;
                        case 'single_ally':
                            $potentialTargets = $actingTeam->getActiveEntities();
                            break;
                        case 'all_allies':
                            $potentialTargets = $actingTeam->getActiveEntities();
                            break;
                        case 'single_enemy':
                            $potentialTargets = $opposingTeam->getActiveEntities();
                            break;
                        case 'all_enemies':
                            $potentialTargets = $opposingTeam->getActiveEntities();
                            break;
                        default:
                            $potentialTargets = $opposingTeam->getActiveEntities();
                            break;
                    }
                } else {
                    $potentialTargets = $opposingTeam->getActiveEntities();
                }

                $potentialTargets = array_filter($potentialTargets, fn($t) => $t->current_hp > 0);
                if (empty($potentialTargets) && ($card->card_type === 'weapon' || ($card->card_type === 'ability' && strpos($card->effect_details['type'] ?? '', 'damage') !== false))) {
                    continue;
                }

                foreach ($potentialTargets as $targetCandidate) {
                    $currentScore = 0;

                    if ($priorityType === 'damage' && strpos($card->effect_details['type'] ?? '', 'damage') !== false) {
                        $currentScore += ($card->effect_details['damage'] ?? 0);
                        if (isset($card->effect_details['aoe_damage'])) $currentScore += 5;
                        if ($targetCandidate->current_hp <= ($card->effect_details['damage'] ?? 0)) $currentScore += 10;
                    } elseif ($priorityType === 'defense' && (strpos($card->effect_details['type'] ?? '', 'reduction') !== false || strpos($card->effect_details['type'] ?? '', 'block') !== false || strpos($card->effect_details['type'] ?? '', 'immunity') !== false)) {
                        $currentScore += 8;
                        if ($activeEntity->current_hp / $activeEntity->max_hp < ($this->persona['buff_use_threshold'] ?? 0.5)) $currentScore += 5;
                    } elseif ($priorityType === 'heal' && strpos($card->effect_details['type'] ?? '', 'heal') !== false) {
                        $currentScore += 7;
                        if ($activeEntity->current_hp / $activeEntity->max_hp < ($this->persona['buff_use_threshold'] ?? 0.5)) $currentScore += 10;
                    }

                    if ($targetPriorities === 'lowest_hp') {
                        if ($targetCandidate->team->isPlayerTeam !== $activeEntity->team->isPlayerTeam) {
                            $currentScore += (100 - ($targetCandidate->current_hp / $targetCandidate->max_hp * 100));
                        }
                    } elseif ($targetPriorities === 'self_lowest_hp') {
                        if ($targetCandidate->team->isPlayerTeam === $activeEntity->team->isPlayerTeam) {
                            $currentScore += (100 - ($targetCandidate->current_hp / $targetCandidate->max_hp * 100));
                        }
                    } else {
                        $currentScore += 1;
                    }

                    if ($currentScore > $bestScore) {
                        $bestScore = $currentScore;
                        $bestAction = ['card' => $card, 'target_entity' => $targetCandidate];
                    }
                }
            }
        }

        return $bestAction;
    }
}
?>
